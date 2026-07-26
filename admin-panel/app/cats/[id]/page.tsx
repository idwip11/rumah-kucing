"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { CatDetail } from "@/lib/types";

export default function CatDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [cat, setCat] = useState<CatDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getCat(id)
      .then(setCat)
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Cat Detail" />
        <main className="flex-1 overflow-y-auto p-6">
          <Link
            href="/cats"
            className="mb-4 inline-block text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke Cats
          </Link>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {!cat ? (
            <p className="text-sm text-gray-400">Memuat...</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {cat.name}
                  </h2>
                  {cat.sterilized && <Badge color="green">Steril</Badge>}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {cat.breed ?? "Ras campuran"}
                  {cat.breedOrigin ? ` (${cat.breedOrigin})` : ""}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-gray-400">Usia</p>
                    <p className="font-medium">{cat.ageLabel ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Berat</p>
                    <p className="font-medium">{cat.weightKg ?? "-"} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Gender</p>
                    <p className="font-medium">{cat.gender ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Lifestyle</p>
                    <p className="font-medium">{cat.lifestyle ?? "-"}</p>
                  </div>
                </div>
                {cat.estimatedDateOfBirth && (
                  <p className="mt-3 text-sm text-gray-500">
                    <span className="font-medium">Tgl Lahir (estimasi):</span>{" "}
                    {new Date(cat.estimatedDateOfBirth).toLocaleDateString(
                      "id-ID",
                    )}
                  </p>
                )}
                {cat.owner && (
                  <p className="mt-3 text-sm text-gray-500">
                    Pemilik:{" "}
                    <Link
                      href={`/users/${cat.owner.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {cat.owner.name}
                    </Link>{" "}
                    ({cat.owner.email})
                  </p>
                )}
                {cat.notes && (
                  <p className="mt-3 text-sm text-gray-600">{cat.notes}</p>
                )}
              </div>

              <div>
                <PageHeader
                  title="Timeline Events"
                  subtitle={`${cat.timelineEvents.length} event`}
                />
                <div className="space-y-2">
                  {cat.timelineEvents.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{e.title}</p>
                        <Badge color="blue">{e.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(e.eventDate).toLocaleDateString("id-ID")}{" "}
                        &middot; {e.category}
                      </p>
                      {e.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {e.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {cat.timelineEvents.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada event</p>
                  )}
                </div>
              </div>

              <div>
                <PageHeader
                  title="Achievements"
                  subtitle={`${cat.achievements.length} pencapaian`}
                />
                <div className="space-y-2">
                  {cat.achievements.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{a.title}</p>
                        {a.rank != null && (
                          <Badge color="purple">#{a.rank}</Badge>
                        )}
                      </div>
                      {a.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {a.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(a.achievedAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  ))}
                  {cat.achievements.length === 0 && (
                    <p className="text-sm text-gray-400">
                      Belum ada pencapaian
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400">
                Total chat: {cat.chatCount}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
