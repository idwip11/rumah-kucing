import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Cat,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Calendar,
  BookOpen,
  PawPrint,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/cats", label: "Cats", icon: Cat },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/breeds", label: "Breeds", icon: PawPrint },
  { href: "/articles", label: "Articles", icon: BookOpen },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
          RK
        </div>
        <span className="text-lg font-bold text-gray-900">Admin Panel</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-gray-400">
        Rumah Kucing Admin
      </div>
    </aside>
  );
}
