export function formatTime(dateInput) {
  if (!dateInput) return "—";
  return new Date(dateInput).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateInput) {
  if (!dateInput) return "—";
  return new Date(dateInput).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatWorkingHours(decimalHours) {
  if (!decimalHours || decimalHours <= 0) return "—";
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export const statusColors = {
  Present: "bg-emerald-50 text-emerald-700",
  Late: "bg-amber-50 text-amber-700",
  Absent: "bg-red-50 text-red-700",
  "Half Day": "bg-sky-50 text-sky-700",
};
