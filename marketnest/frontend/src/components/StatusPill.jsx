const labels = {
  pending: "Awaiting confirmation",
  processing: "Being prepared",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  completed: "Completed",
};

const classes = {
  pending: "status-pending",
  processing: "status-processing",
  out_for_delivery: "status-processing",
  delivered: "status-delivered",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function StatusPill({ status }) {
  return <span className={`status-pill ${classes[status] || "status-pending"}`}>{labels[status] || status}</span>;
}
