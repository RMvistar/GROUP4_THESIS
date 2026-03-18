"""
ML Inference Service for Drainage Monitoring System
====================================================
Exposes a Flask REST API wrapping the pre-trained SVM models:
  - SVC  → classifies current drainage state (0–4)
  - SVR  → estimates seconds to overflow when state is at_risk (2)

Run:
    python ml_service.py

POST /predict
  Body: { "velocity": float, "ultrasonic": float, "tof": float, "rate_of_change": float }
  Returns: {
      "state": int,               // 0=optimal 1=warning 2=at_risk 3=clogged 4=overflow
      "state_label": str,
      "rate_of_change": float,
      "class_probabilities": { <label>: float, ... },
      "estimated_time_to_overflow_s"?: float,   // present when state == 2 or 4
      "estimated_time_to_overflow_min"?: float,
      "estimated_time_to_at_risk_s"?: float,    // present when state == 1
      "estimated_time_to_at_risk_min"?: float
  }

GET /health
  Returns: { "status": "ok" }

Retrain:
    python ml_service.py --retrain
    (requires the CSV training datasets to be in the same directory)
"""

import argparse
import os

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC, SVR

# ── Constants ──────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SVC_MODEL_PATH = os.path.join(BASE_DIR, "svc_classifier.joblib")
SVR_MODEL_PATH = os.path.join(BASE_DIR, "svr_time_to_overflow.joblib")

SVC_DATASET = os.path.join(BASE_DIR, "final_svm_training_dataset.csv")
SVR_DATASET = os.path.join(BASE_DIR, "simulated_at_risk_to_overflow_ultrasonic20.csv")

FEATURES = ["velocity", "ultrasonic", "tof", "rate_of_change"]

LABEL_MAP = {
    0: "optimal",
    1: "warning",
    2: "at_risk",
    3: "clogged",
    4: "overflow",
}

# Calibrated threshold: ultrasonic reading (cm) that marks at_risk
AT_RISK_ULTRASONIC_THRESHOLD_CM = 23.0
# Calibrated water rise rate used to estimate time-to-at_risk in warning state
WARNING_DESCENT_RATE_CM_PER_MIN = 1.1

# ── Model loading ──────────────────────────────────────────────────────────────

svc_pipeline: Pipeline | None = None
svr_pipeline: Pipeline | None = None


def load_models() -> None:
    global svc_pipeline, svr_pipeline
    svc_pipeline = joblib.load(SVC_MODEL_PATH)
    svr_pipeline = joblib.load(SVR_MODEL_PATH)
    print("✅ Models loaded successfully.")


# ── Retraining helpers ─────────────────────────────────────────────────────────

def _build_svc_pipeline() -> Pipeline:
    return Pipeline([
        ("scaler", StandardScaler()),
        ("model", SVC(kernel="rbf", C=10, gamma="scale", class_weight="balanced", probability=True)),
    ])


def _build_svr_pipeline() -> Pipeline:
    return Pipeline([
        ("scaler", StandardScaler()),
        ("model", SVR(kernel="rbf", C=20, epsilon=5, gamma="scale")),
    ])


def retrain_models() -> None:
    """Retrain both models from the CSV datasets and save the .joblib files."""
    print("Training SVC classifier …")
    svc_df = pd.read_csv(SVC_DATASET)
    svc = _build_svc_pipeline()
    svc.fit(svc_df[FEATURES], svc_df["label"])
    joblib.dump(svc, SVC_MODEL_PATH)
    print(f"  → Saved to {SVC_MODEL_PATH}")

    print("Training SVR regressor …")
    svr_df = pd.read_csv(SVR_DATASET)
    svr_df = svr_df[svr_df["label"] == 2].copy()
    svr = _build_svr_pipeline()
    svr.fit(svr_df[FEATURES], svr_df["time_to_overflow_s"])
    joblib.dump(svr, SVR_MODEL_PATH)
    print(f"  → Saved to {SVR_MODEL_PATH}")

    print("✅ Retraining complete.")


# ── Flask app ──────────────────────────────────────────────────────────────────

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    if svc_pipeline is None or svr_pipeline is None:
        return jsonify({"error": "Models not loaded"}), 503

    body = request.get_json(force=True, silent=True)
    if body is None:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        velocity = float(body.get("velocity", 0))
        ultrasonic = float(body.get("ultrasonic", 0))
        tof = float(body.get("tof", 0))
        rate_of_change = float(body.get("rate_of_change", 0))
    except (TypeError, ValueError) as exc:
        return jsonify({"error": f"Invalid input: {exc}"}), 400

    row = pd.DataFrame([{
        "velocity": velocity,
        "ultrasonic": ultrasonic,
        "tof": tof,
        "rate_of_change": rate_of_change,
    }])

    label_num = int(svc_pipeline.predict(row)[0])
    probs = svc_pipeline.predict_proba(row)[0]
    classes = svc_pipeline.named_steps["model"].classes_

    class_probabilities = {
        LABEL_MAP[int(cls)]: float(round(prob, 4))
        for cls, prob in zip(classes, probs)
    }

    result = {
        "state": label_num,
        "state_label": LABEL_MAP[label_num],
        "rate_of_change": round(rate_of_change, 4),
        "class_probabilities": class_probabilities,
    }

    if label_num == 2:  # at_risk — SVR gives time to overflow
        est_s = float(svr_pipeline.predict(row)[0])
        est_s = round(max(0.0, est_s), 2)
        result["estimated_time_to_overflow_s"] = est_s
        result["estimated_time_to_overflow_min"] = round(est_s / 60.0, 2)

    elif label_num == 1:  # warning — heuristic time to at_risk
        if ultrasonic > AT_RISK_ULTRASONIC_THRESHOLD_CM:
            est_min = (ultrasonic - AT_RISK_ULTRASONIC_THRESHOLD_CM) / WARNING_DESCENT_RATE_CM_PER_MIN
            est_min = round(max(0.0, est_min), 2)
        else:
            est_min = 0.0
        result["estimated_time_to_at_risk_min"] = est_min
        result["estimated_time_to_at_risk_s"] = round(est_min * 60.0, 2)

    elif label_num == 4:  # overflow
        result["estimated_time_to_overflow_s"] = 0.0
        result["estimated_time_to_overflow_min"] = 0.0

    return jsonify(result)


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Drainage ML inference service")
    parser.add_argument(
        "--retrain",
        action="store_true",
        help="Retrain models from CSV datasets and exit (do not start the server)",
    )
    parser.add_argument("--port", type=int, default=5002, help="Port to run the server on (default: 5002)")
    args = parser.parse_args()

    if args.retrain:
        retrain_models()
    else:
        load_models()
        print(f"🚀 ML service running on http://0.0.0.0:{args.port}")
        app.run(host="0.0.0.0", port=args.port)
