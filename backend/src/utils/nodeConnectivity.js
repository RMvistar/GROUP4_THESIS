export const NODE_OFFLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function getNodeConnectivityStatus(lastUpdate) {
  if (!lastUpdate) {
    return "offline";
  }

  const lastSeen = new Date(lastUpdate).getTime();
  if (Number.isNaN(lastSeen)) {
    return "offline";
  }

  return Date.now() - lastSeen <= NODE_OFFLINE_THRESHOLD_MS
    ? "online"
    : "offline";
}

export function isNodeOnline(lastUpdate) {
  return getNodeConnectivityStatus(lastUpdate) === "online";
}
