export const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  ACCEPTED: "Accepted — awaiting pickup",
  REJECTED: "Rejected",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
};

export const TRAVEL_PHASE_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  DEPARTED: "Departed",
  EN_ROUTE: "En route",
  LANDED: "Landed",
  AT_RENDEZVOUS: "At rendezvous",
};

export const JOURNEY_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  IN_TRANSIT: "In transit",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
