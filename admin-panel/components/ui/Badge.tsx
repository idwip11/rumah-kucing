import type { ReactNode } from "react";

type BadgeColor =
  | "gray"
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange";

const colorMap: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-800",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700",
};

export function Badge({
  children,
  color = "gray",
  className = "",
}: {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function orderStatusColor(status: string): BadgeColor {
  switch (status) {
    case "Menunggu":
      return "yellow";
    case "Dikonfirmasi":
      return "blue";
    case "Selesai":
      return "green";
    case "Batal":
      return "red";
    default:
      return "gray";
  }
}
