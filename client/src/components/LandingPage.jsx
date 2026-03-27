import "./LandingPage.css";
import NavigationBar from "./NavigationBar";
import {
  FaNetworkWired,
  FaBell,
  FaChartLine,
  FaEye,
  FaBrain,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";

function LandingPage() {
  return (
    <>
      <NavigationBar />

      <div className="landing-page-wrapper">
        <div className="landing-page-content">
          <h1 className="header-text">
            Stay Safe with Real-time Overflow and Clog Alerts
          </h1>

          <h2 className="subheader-text">
            A MACHINE LEARNING APPROACH TO OVERFLOW PREDICTION, DRAINAGE ANOMALY
            DETECTION, AND ALERT VALIDATION
          </h2>

          <div className="description-container">
            <div className="description">
              <div className="icon-wrapper">
                <FaNetworkWired />
              </div>
              <h3>Node Details</h3>
              <p>View real-time node status and monitoring data</p>
            </div>

            <div className="description">
              <div className="icon-wrapper">
                <FaBell />
              </div>
              <h3>Real-time Alerts</h3>
              <p>Instant notifications on your phone</p>
            </div>

            <div className="description">
              <div className="icon-wrapper">
                <FaChartLine />
              </div>
              <h3>Accurate Prediction</h3>
              <p>Provide early warnings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-page-wrapper-2">
        <div className="landing-page-content">
          <h1 className="header-text">How it works</h1>
          <h2 className="subheader-text">Stay ahead of Rising Waters</h2>

          <div className="description-container">
            <div className="description">
              <div className="icon-wrapper">
                <FaEye />
              </div>
              <h3>1. Monitor</h3>
              <p>Continuous monitoring of drainage overflow and clog status</p>
            </div>

            <div className="description">
              <div className="icon-wrapper">
                <FaBrain />
              </div>
              <h3>2. Predict</h3>
              <p>Machine learning predicts overflow and detects anomalies</p>
            </div>

            <div className="description">
              <div className="icon-wrapper">
                <FaBell />
              </div>
              <h3>3. Alert Workers</h3>
              <p>Workers are notified and confirm response status</p>
            </div>

            <div className="description">
              <div className="icon-wrapper">
                <FaUsers />
              </div>
              <h3>4. Notify Public</h3>
              <p>Public users receive real-time alerts and updates</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
