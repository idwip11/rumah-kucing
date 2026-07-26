"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminApi } from "@/lib/api";

export function Header({ title }: { title: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error("Admin logout failed", error);
    }
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
