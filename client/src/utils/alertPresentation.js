function normalizeAlertKind(task) {
  const alertText = `${task?.title || ""} ${task?.description || ""}`
    .toLowerCase()
    .trim();

  if (alertText.includes("battery")) {
    return "low_battery";
  }

  if (
    alertText.includes("offline") ||
    alertText.includes("disconnected") ||
    alertText.includes("not reporting")
  ) {
    return "offline";
  }

  return "clog";
}

export function getAlertCardContent(task) {
  const location = task?.node_id?.location || "Unknown Node";
  const kind = normalizeAlertKind(task);

  if (kind === "low_battery") {
    return {
      title: "Low Battery",
      description: `Low battery detected at ${location}. Please check the power level and replace or recharge the battery as needed.`,
    };
  }

  if (kind === "offline") {
    return {
      title: "Offline",
      description: `Offline status detected at ${location}. The node is not reporting and requires inspection.`,
    };
  }

  return {
    title: "Clog",
    description: `Clog detected at ${location}. Immediate inspection and clearing are recommended.`,
  };
}
