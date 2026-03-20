import { getAlertCardContent } from "./alertPresentation";

function normalizeTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildSensorEventDescription(eventItem) {
  const parts = [];

  if (eventItem?.water_level !== undefined && eventItem?.water_level !== null) {
    parts.push(`Water Level: ${Number(eventItem.water_level).toFixed(2)} cm`);
  }

  if (eventItem?.flow_rate !== undefined && eventItem?.flow_rate !== null) {
    parts.push(`Flow: ${eventItem.flow_rate} cm/s`);
  }

  return parts.join(" | ");
}

function matchesNode(task, node) {
  const taskNodeId = task?.node_id?.node_id;
  const taskLocation = task?.node_id?.location;

  if (node?.node_id && taskNodeId && node.node_id === taskNodeId) {
    return true;
  }

  if (node?.location && taskLocation && node.location === taskLocation) {
    return true;
  }

  return false;
}

export function buildHistoricalTrendEvents({ node, historyEvents = [], alerts = [] }) {
  const sensorEvents = historyEvents
    .filter(
      (eventItem) =>
        eventItem?.event_type === "clog" || eventItem?.event_type === "overflow",
    )
    .map((eventItem, index) => {
      const timestamp = normalizeTimestamp(eventItem.timestamp);
      if (!timestamp) return null;

      return {
        id: `history-${node?.node_id || "node"}-${eventItem.event_type}-${timestamp}-${index}`,
        timestamp,
        date: timestamp.slice(0, 10),
        type: eventItem.event_type,
        source: "Sensor Feed",
        title: eventItem.event_type === "overflow" ? "Overflow" : "Clog",
        description:
          buildSensorEventDescription(eventItem) ||
          "Incident detected from live sensor history.",
      };
    })
    .filter(Boolean);

  const taskEvents = alerts
    .filter((task) => matchesNode(task, node))
    .map((task, index) => {
      const alertCard = getAlertCardContent(task);
      if (alertCard.title !== "Clog") {
        return null;
      }

      const timestamp = normalizeTimestamp(
        task.timestamp || task.completed_date || task.created_date || task.updatedAt,
      );
      if (!timestamp) return null;

      return {
        id: `task-${task._id || index}-${timestamp}`,
        timestamp,
        date: timestamp.slice(0, 10),
        type: "clog",
        source: "Alert Feed",
        title: alertCard.title,
        description: alertCard.description,
      };
    })
    .filter(Boolean);

  const mergedEvents = [...sensorEvents, ...taskEvents].sort(
    (firstEvent, secondEvent) =>
      new Date(secondEvent.timestamp).getTime() -
      new Date(firstEvent.timestamp).getTime(),
  );

  return mergedEvents.filter((event, index, allEvents) => {
    return (
      allEvents.findIndex(
        (candidate) =>
          candidate.timestamp === event.timestamp &&
          candidate.type === event.type &&
          candidate.source === event.source,
      ) === index
    );
  });
}
