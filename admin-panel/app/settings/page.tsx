"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Settings" />
        <main className="flex-1 overflow-y-auto p-6">
          <PageHeader title="Settings" subtitle="Konfigurasi admin panel" />
          <div className="max-w-2xl space-y-4">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700">
                Customer API Endpoint
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Admin panel terhubung ke customer app melalui environment
                variable{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                  NEXT_PUBLIC_CUSTOMER_API_URL
                </code>
                .
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Default:{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                  http://localhost:3000
                </code>
              </p>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700">
                Admin Authentication
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Akses menggunakan akun admin dari tabel{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                  admin_users
                </code>
                . Password disimpan sebagai hash bcrypt, lalu login membuat
                cookie session HTTP-only yang ditandatangani server.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Buat atau reset akun admin melalui command-line script, bukan
                lewat registrasi publik.
              </p>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700">
                Admin Session Secret
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Session admin ditandatangani menggunakan environment variable{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                  ADMIN_SESSION_SECRET
                </code>{" "}
                pada customer app. Gunakan nilai yang panjang dan rahasia di
                production.
              </p>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700">Logout</h3>
              <p className="mt-1 text-sm text-gray-500">
                Gunakan tombol Logout di pojok kanan atas untuk menghapus cookie
                session admin.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
