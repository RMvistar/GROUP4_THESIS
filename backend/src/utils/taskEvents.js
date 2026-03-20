export const TASK_STATUS_LABELS = {
  pending: "Unresolved",
  ongoing: "Ongoing",
  resolved: "Resolved",
};

export function buildTaskSocketPayload(task) {
  if (!task) return null;
  const nodeLocation =
    task.node_id?.location || task.node_location || "Unknown Node";
  const timestamp =
    task.timestamp ||
    task.updatedAt ||
    task.completed_date ||
    task.created_date ||
    new Date().toISOString();

  return {
    _id: task._id,
    task_id: task.task_id,
    title: task.title,
    description: task.description,
    status: task.status,
    node_location: nodeLocation,
    node_id: { location: nodeLocation },
    created_date: task.created_date,
    completed_date: task.completed_date,
    timestamp,
    event_id: `${task._id}-${task.status}-${timestamp}`,
  };
}

export function emitTaskUpdate(io, task) {
  if (!io || !task) return;
  const payload = buildTaskSocketPayload(task);
  if (!payload) return;
  io.emit("task_update", payload);
}
