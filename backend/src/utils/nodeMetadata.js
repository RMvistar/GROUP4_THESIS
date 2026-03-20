export function normalizeSensorId(sensorId) {
  return String(sensorId || "").trim().toUpperCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildSensorIdQuery(sensorId) {
  const normalized = normalizeSensorId(sensorId);
  if (!normalized) {
    return normalized;
  }

  return {
    $regex: `^${escapeRegExp(normalized)}$`,
    $options: "i",
  };
}

export function buildAutoNodeId(sensorId) {
  const cleaned = normalizeSensorId(sensorId)
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);

  return `NODE-${cleaned || "AUTO"}`;
}

export function buildUnclaimedLocation(sensorId) {
  const normalized = normalizeSensorId(sensorId);

  return normalized
    ? `Unclaimed Node - ${normalized}`
    : "Unclaimed Node";
}

export function isUnclaimedNodeLocation(location) {
  const normalizedLocation = String(location || "").trim();

  return (
    normalizedLocation.startsWith("Unclaimed Node") ||
    normalizedLocation.startsWith("Auto Node ")
  );
}

export function isNodeClaimed(node) {
  if (!node) {
    return false;
  }

  if (node.is_claimed === false) {
    return false;
  }

  return !isUnclaimedNodeLocation(node.location);
}
