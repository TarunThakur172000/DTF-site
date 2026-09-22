const STATUS_STYLES: Record<string, string> = {
  Shipped: "bg-blue-50 text-blue-600",
  Delivered: "bg-success-50 text-success-600",
  "In Production": "bg-amber-50 text-amber-600",
  "Awaiting Approval": "bg-primary-50 text-primary-400",
  Pending: "bg-amber-50 text-amber-600",
  Quoted: "bg-success-50 text-success-600",
  Expired: "bg-red-50 text-red-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-primary-50 text-primary-400"}`}>
      {status}
    </span>
  );
}
