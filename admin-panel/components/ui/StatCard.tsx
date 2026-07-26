import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "green" | "purple" | "orange" | "gray";
}) {
  const accentMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    gray: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${accentMap[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
