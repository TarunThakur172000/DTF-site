const STATUS_STYLES: Record<string, string> = {
  Shipped: "bg-blue-50 text-blue-600",
  Delivered: "bg-success-50 text-success-600",
  "In Production": "bg-amber-50 text-amber-600",
  "Awaiting Approval": "bg-primary-50 text-primary-400",
  Pending: "bg-amber-50 text-amber-600",
  "Pending payment": "bg-amber-50 text-amber-600",
  Processing: "bg-blue-50 text-blue-600",
  "On hold": "bg-amber-50 text-amber-600",
  Completed: "bg-success-50 text-success-600",
  Cancelled: "bg-red-50 text-red-500",
  Refunded: "bg-primary-50 text-primary-400",
  "Payment failed": "bg-red-50 text-red-500",
  Draft: "bg-primary-50 text-primary-400",
  Quoted: "bg-success-50 text-success-600",
  Expired: "bg-red-50 text-red-500",
};

export function StatusBadge({ status }: { status?: string | null }) {
  const rawStatus = status?.trim() ?? "";
  const normalizedStatus = rawStatus.toLowerCase().replace(/_/g, "-");
  const labels: Record<string, string> = {
    pending: "Pending payment",
    processing: "Processing",
    "on-hold": "On hold",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    failed: "Payment failed",
    "checkout-draft": "Draft",
  };
  const displayStatus = rawStatus
    ? labels[normalizedStatus] ?? rawStatus
    : "Status unavailable";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[displayStatus] ?? "bg-primary-50 text-primary-400"}`}>
      {displayStatus}
    </span>
  );
}
