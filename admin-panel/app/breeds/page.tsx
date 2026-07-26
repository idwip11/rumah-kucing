"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { AdminBreed, BreedInput } from "@/lib/types";

type TabId = "basic" | "scores" | "care" | "health" | "media";

interface FormState {
  slug: string;
  name: string;
  origin: string;
  alternativeNames: string;
  imageSrc: string;
  backdropImageSrc: string;
  shortDescription: string;
  profileSummary: string;
  history: string;
  personalityDescription: string;
  foodType: string;
  kittenPriceLabel: string;
  monthlyCareLabel: string;
  careLevel: string;
  availability: string;
  matchLabel: string;
  sizeLabel: string;
  maleWeightRange: string;
  femaleWeightRange: string;
  lifeExpectancy: string;
  coatLength: string;
  coatPatterns: string;
  activityLevel: string;
  vocalLevel: string;
  indoorFit: string;
  beginnerFitScore: string;
  activityScore: string;
  friendlinessScore: string;
  groomingScore: string;
  vocalScore: string;
  adaptabilityScore: string;
  childFriendlyScore: string;
  petFriendlyScore: string;
  sourceNotes: string;
  contentUpdatedAt: string;
  commercialUpdatedAt: string;
  isPublished: boolean;
  isFeatured: boolean;
  characteristics: string;
  brushingFrequency: string;
  bathing: string;
  eyeCare: string;
  earCare: string;
  nailCare: string;
  dentalCare: string;
  sheddingLevel: string;
  hairballRisk: string;
  careNotes: string;
  lifeStageNotes: string;
  proteinNotes: string;
  hydrationNotes: string;
  portionNotes: string;
  obesityRisk: string;
  specialNeeds: string;
  healthNotes: string;
  goodFor: string;
  considerIf: string;
  initialCostLabel: string;
  costMonthlyLabel: string;
  groomingCostLabel: string;
  vaccineCheckupLabel: string;
  starterKitLabel: string;
  cityLabel: string;
  costNotes: string;
  galleryImages: string;
  colorPatterns: string;
  similarBreeds: string;
}

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  origin: "",
  alternativeNames: "",
  imageSrc: "",
  backdropImageSrc: "",
  shortDescription: "",
  profileSummary: "",
  history: "",
  personalityDescription: "",
  foodType: "",
  kittenPriceLabel: "",
  monthlyCareLabel: "",
  careLevel: "",
  availability: "",
  matchLabel: "",
  sizeLabel: "",
  maleWeightRange: "",
  femaleWeightRange: "",
  lifeExpectancy: "",
  coatLength: "",
  coatPatterns: "",
  activityLevel: "",
  vocalLevel: "",
  indoorFit: "",
  beginnerFitScore: "",
  activityScore: "",
  friendlinessScore: "",
  groomingScore: "",
  vocalScore: "",
  adaptabilityScore: "",
  childFriendlyScore: "",
  petFriendlyScore: "",
  sourceNotes: "",
  contentUpdatedAt: "",
  commercialUpdatedAt: "",
  isPublished: true,
  isFeatured: false,
  characteristics: "",
  brushingFrequency: "",
  bathing: "",
  eyeCare: "",
  earCare: "",
  nailCare: "",
  dentalCare: "",
  sheddingLevel: "",
  hairballRisk: "",
  careNotes: "",
  lifeStageNotes: "",
  proteinNotes: "",
  hydrationNotes: "",
  portionNotes: "",
  obesityRisk: "",
  specialNeeds: "",
  healthNotes: "",
  goodFor: "",
  considerIf: "",
  initialCostLabel: "",
  costMonthlyLabel: "",
  groomingCostLabel: "",
  vaccineCheckupLabel: "",
  starterKitLabel: "",
  cityLabel: "",
  costNotes: "",
  galleryImages: "",
  colorPatterns: "",
  similarBreeds: "",
};

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "basic", label: "Basic & SEO" },
  { id: "scores", label: "Scores" },
  { id: "care", label: "Care & Nutrition" },
  { id: "health", label: "Health & Fit" },
  { id: "media", label: "Costs & Media" },
];

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

function splitComma(value: string) {
  const seen = new Set<string>();
  return value
    .split(",")
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function clean(value: string) {
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function cleanScore(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(1, Math.min(10, Math.round(number)));
}

function dateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function pipeLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()));
}

function formFromBreed(breed: AdminBreed): FormState {
  return {
    ...EMPTY_FORM,
    slug: breed.slug,
    name: breed.name,
    origin: breed.origin ?? "",
    alternativeNames: breed.alternativeNames.join(", "),
    imageSrc: breed.imageSrc ?? "",
    backdropImageSrc: breed.backdropImageSrc ?? "",
    shortDescription: breed.shortDescription ?? "",
    profileSummary: breed.profileSummary ?? "",
    history: breed.history ?? "",
    personalityDescription: breed.personalityDescription ?? "",
    foodType: breed.foodType ?? "",
    kittenPriceLabel: breed.kittenPriceLabel ?? "",
    monthlyCareLabel: breed.monthlyCareLabel ?? "",
    careLevel: breed.careLevel ?? "",
    availability: breed.availability ?? "",
    matchLabel: breed.matchLabel ?? "",
    sizeLabel: breed.sizeLabel ?? "",
    maleWeightRange: breed.maleWeightRange ?? "",
    femaleWeightRange: breed.femaleWeightRange ?? "",
    lifeExpectancy: breed.lifeExpectancy ?? "",
    coatLength: breed.coatLength ?? "",
    coatPatterns: breed.coatPatterns ?? "",
    activityLevel: breed.activityLevel ?? "",
    vocalLevel: breed.vocalLevel ?? "",
    indoorFit: breed.indoorFit ?? "",
    beginnerFitScore: breed.beginnerFitScore?.toString() ?? "",
    activityScore: breed.activityScore?.toString() ?? "",
    friendlinessScore: breed.friendlinessScore?.toString() ?? "",
    groomingScore: breed.groomingScore?.toString() ?? "",
    vocalScore: breed.vocalScore?.toString() ?? "",
    adaptabilityScore: breed.adaptabilityScore?.toString() ?? "",
    childFriendlyScore: breed.childFriendlyScore?.toString() ?? "",
    petFriendlyScore: breed.petFriendlyScore?.toString() ?? "",
    sourceNotes: breed.sourceNotes ?? "",
    contentUpdatedAt: dateInput(breed.contentUpdatedAt),
    commercialUpdatedAt: dateInput(breed.commercialUpdatedAt),
    isPublished: breed.isPublished,
    isFeatured: breed.isFeatured,
    characteristics: breed.characteristics.join(", "),
    brushingFrequency: breed.careGuide?.brushingFrequency ?? "",
    bathing: breed.careGuide?.bathing ?? "",
    eyeCare: breed.careGuide?.eyeCare ?? "",
    earCare: breed.careGuide?.earCare ?? "",
    nailCare: breed.careGuide?.nailCare ?? "",
    dentalCare: breed.careGuide?.dentalCare ?? "",
    sheddingLevel: breed.careGuide?.sheddingLevel ?? "",
    hairballRisk: breed.careGuide?.hairballRisk ?? "",
    careNotes: breed.careGuide?.notes ?? "",
    lifeStageNotes: breed.nutritionGuide?.lifeStageNotes ?? "",
    proteinNotes: breed.nutritionGuide?.proteinNotes ?? "",
    hydrationNotes: breed.nutritionGuide?.hydrationNotes ?? "",
    portionNotes: breed.nutritionGuide?.portionNotes ?? "",
    obesityRisk: breed.nutritionGuide?.obesityRisk ?? "",
    specialNeeds: breed.nutritionGuide?.specialNeeds ?? "",
    healthNotes: breed.healthNotes
      .map(
        (item) =>
          `${item.title} | ${item.description} | ${item.severityLabel ?? ""} | ${
            item.monitoringTips ?? ""
          }`,
      )
      .join("\n"),
    goodFor: breed.suitabilities
      .filter((item) => item.type === "good_for")
      .map((item) => `${item.label} | ${item.description ?? ""}`)
      .join("\n"),
    considerIf: breed.suitabilities
      .filter((item) => item.type === "consider_if")
      .map((item) => `${item.label} | ${item.description ?? ""}`)
      .join("\n"),
    initialCostLabel: breed.costEstimates[0]?.initialCostLabel ?? "",
    costMonthlyLabel: breed.costEstimates[0]?.monthlyCostLabel ?? "",
    groomingCostLabel: breed.costEstimates[0]?.groomingCostLabel ?? "",
    vaccineCheckupLabel: breed.costEstimates[0]?.vaccineCheckupLabel ?? "",
    starterKitLabel: breed.costEstimates[0]?.starterKitLabel ?? "",
    cityLabel: breed.costEstimates[0]?.cityLabel ?? "",
    costNotes: breed.costEstimates[0]?.notes ?? "",
    galleryImages: breed.galleryImages
      .map(
        (item) =>
          `${item.url} | ${item.type} | ${item.alt ?? ""} | ${item.credit ?? ""} | ${
            item.sourceUrl ?? ""
          }`,
      )
      .join("\n"),
    colorPatterns: breed.colorPatterns
      .map(
        (item) =>
          `${item.name} | ${item.description ?? ""} | ${item.imageUrl ?? ""}`,
      )
      .join("\n"),
    similarBreeds: breed.similarBreeds
      .map(
        (item) =>
          `${item.similarBreedSlug ?? item.similarBreedId} | ${item.reason ?? ""}`,
      )
      .join("\n"),
  };
}

export default function BreedsPage() {
  const [breeds, setBreeds] = useState<AdminBreed[]>([]);
  const [breedOptions, setBreedOptions] = useState<AdminBreed[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const breedBySlugOrId = useMemo(() => {
    const map = new Map<string, AdminBreed>();
    for (const breed of breedOptions) {
      map.set(breed.id, breed);
      map.set(breed.slug, breed);
    }
    return map;
  }, [breedOptions]);

  const load = useCallback(() => {
    setError("");
    setLoading(true);
    adminApi
      .getBreeds({ page, limit, search })
      .then((res) => {
        setBreeds(res.breeds);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminApi
      .getBreeds({ page: 1, limit: 100 })
      .then((res) => setBreedOptions(res.breeds))
      .catch(() => undefined);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setActiveTab("basic");
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(breed: AdminBreed) {
    setEditingId(breed.id);
    setForm(formFromBreed(breed));
    setActiveTab("basic");
    setFormError("");
    setModalOpen(true);
  }

  function buildPayload(): BreedInput {
    return {
      slug: generateSlug(form.slug || form.name),
      name: form.name.trim(),
      origin: clean(form.origin),
      imageSrc: clean(form.imageSrc),
      profileSummary: clean(form.profileSummary),
      foodType: clean(form.foodType),
      kittenPriceLabel: clean(form.kittenPriceLabel),
      monthlyCareLabel: clean(form.monthlyCareLabel),
      careLevel: clean(form.careLevel),
      availability: clean(form.availability),
      matchLabel: clean(form.matchLabel),
      characteristics: splitComma(form.characteristics),
      alternativeNames: splitComma(form.alternativeNames),
      shortDescription: clean(form.shortDescription),
      backdropImageSrc: clean(form.backdropImageSrc),
      history: clean(form.history),
      personalityDescription: clean(form.personalityDescription),
      sizeLabel: clean(form.sizeLabel),
      maleWeightRange: clean(form.maleWeightRange),
      femaleWeightRange: clean(form.femaleWeightRange),
      lifeExpectancy: clean(form.lifeExpectancy),
      coatLength: clean(form.coatLength),
      coatPatterns: clean(form.coatPatterns),
      activityLevel: clean(form.activityLevel),
      vocalLevel: clean(form.vocalLevel),
      indoorFit: clean(form.indoorFit),
      beginnerFitScore: cleanScore(form.beginnerFitScore),
      activityScore: cleanScore(form.activityScore),
      friendlinessScore: cleanScore(form.friendlinessScore),
      groomingScore: cleanScore(form.groomingScore),
      vocalScore: cleanScore(form.vocalScore),
      adaptabilityScore: cleanScore(form.adaptabilityScore),
      childFriendlyScore: cleanScore(form.childFriendlyScore),
      petFriendlyScore: cleanScore(form.petFriendlyScore),
      sourceNotes: clean(form.sourceNotes),
      contentUpdatedAt: clean(form.contentUpdatedAt),
      commercialUpdatedAt: clean(form.commercialUpdatedAt),
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      careGuide: {
        brushingFrequency: clean(form.brushingFrequency),
        bathing: clean(form.bathing),
        eyeCare: clean(form.eyeCare),
        earCare: clean(form.earCare),
        nailCare: clean(form.nailCare),
        dentalCare: clean(form.dentalCare),
        sheddingLevel: clean(form.sheddingLevel),
        hairballRisk: clean(form.hairballRisk),
        notes: clean(form.careNotes),
      },
      nutritionGuide: {
        lifeStageNotes: clean(form.lifeStageNotes),
        proteinNotes: clean(form.proteinNotes),
        hydrationNotes: clean(form.hydrationNotes),
        portionNotes: clean(form.portionNotes),
        obesityRisk: clean(form.obesityRisk),
        specialNeeds: clean(form.specialNeeds),
      },
      healthNotes: pipeLines(form.healthNotes).map((parts, index) => ({
        title: parts[0] ?? "",
        description: parts[1] ?? "",
        severityLabel: clean(parts[2] ?? ""),
        monitoringTips: clean(parts[3] ?? ""),
        sortOrder: index,
      })),
      suitabilities: [
        ...pipeLines(form.goodFor).map((parts, index) => ({
          type: "good_for" as const,
          label: parts[0] ?? "",
          description: clean(parts[1] ?? ""),
          sortOrder: index,
        })),
        ...pipeLines(form.considerIf).map((parts, index) => ({
          type: "consider_if" as const,
          label: parts[0] ?? "",
          description: clean(parts[1] ?? ""),
          sortOrder: index,
        })),
      ],
      costEstimates: [
        {
          initialCostLabel: clean(form.initialCostLabel),
          monthlyCostLabel: clean(form.costMonthlyLabel),
          groomingCostLabel: clean(form.groomingCostLabel),
          vaccineCheckupLabel: clean(form.vaccineCheckupLabel),
          starterKitLabel: clean(form.starterKitLabel),
          cityLabel: clean(form.cityLabel),
          notes: clean(form.costNotes),
        },
      ],
      galleryImages: pipeLines(form.galleryImages).map((parts, index) => ({
        url: parts[0] ?? "",
        type: parts[1] || "other",
        alt: clean(parts[2] ?? ""),
        credit: clean(parts[3] ?? ""),
        sourceUrl: clean(parts[4] ?? ""),
        sortOrder: index,
      })),
      colorPatterns: pipeLines(form.colorPatterns).map((parts, index) => ({
        name: parts[0] ?? "",
        description: clean(parts[1] ?? ""),
        imageUrl: clean(parts[2] ?? ""),
        sortOrder: index,
      })),
      similarBreeds: pipeLines(form.similarBreeds)
        .map((parts, index) => {
          const target = breedBySlugOrId.get(parts[0] ?? "");
          return {
            similarBreedId: target?.id ?? "",
            reason: clean(parts[1] ?? ""),
            sortOrder: index,
          };
        })
        .filter((item) => item.similarBreedId),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = buildPayload();
      if (editingId) {
        await adminApi.updateBreed(editingId, payload);
      } else {
        await adminApi.createBreed(payload);
      }
      setModalOpen(false);
      load();
      adminApi
        .getBreeds({ page: 1, limit: 100 })
        .then((res) => setBreedOptions(res.breeds))
        .catch(() => undefined);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(breed: AdminBreed) {
    if (
      !confirm(
        `Hapus ras "${breed.name}"? Profil kucing dan artikel yang memakai ras ini akan kehilangan referensi ras.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await adminApi.deleteBreed(breed.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const columns: Column<AdminBreed>[] = [
    {
      key: "name",
      header: "Ras",
      render: (breed) => (
        <div>
          <div className="font-semibold text-gray-900">{breed.name}</div>
          <div className="text-xs text-gray-500">{breed.slug}</div>
        </div>
      ),
    },
    { key: "origin", header: "Asal", render: (breed) => breed.origin ?? "-" },
    {
      key: "status",
      header: "Status",
      render: (breed) => (
        <div className="flex flex-wrap gap-1">
          <Badge color={breed.isPublished ? "green" : "gray"}>
            {breed.isPublished ? "Published" : "Draft"}
          </Badge>
          {breed.isFeatured && <Badge color="blue">Featured</Badge>}
        </div>
      ),
    },
    {
      key: "scores",
      header: "Scores",
      render: (breed) => (
        <span className="text-xs text-gray-600">
          Pemula {breed.beginnerFitScore ?? "-"} / Grooming{" "}
          {breed.groomingScore ?? "-"}
        </span>
      ),
    },
    {
      key: "counts",
      header: "Dipakai",
      render: (breed) =>
        `${breed.catCount} kucing / ${breed.articleCount} artikel`,
    },
    {
      key: "characteristics",
      header: "Karakteristik",
      render: (breed) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {breed.characteristics.slice(0, 4).map((item) => (
            <Badge key={item} color="gray">
              {item}
            </Badge>
          ))}
          {breed.characteristics.length > 4 && (
            <Badge color="gray">+{breed.characteristics.length - 4}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (breed) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(breed)}
            className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(breed)}
            className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Breeds" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <PageHeader
              title="Daftar Ras Kucing"
              subtitle="Kelola Catpedia yang dipakai Ketty AI dan Customer App"
            />
            <button
              onClick={openCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Tambah Ras
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-4 flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="input max-w-md"
              placeholder="Cari ras, asal, ringkasan, atau metadata..."
            />
            {search && (
              <button
                onClick={() => {
                  setPage(1);
                  setSearch("");
                }}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Reset
              </button>
            )}
          </div>

          <DataTable
            columns={columns}
            rows={breeds}
            emptyMessage={loading ? "Memuat..." : "Tidak ada ras kucing"}
          />
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
          >
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Catpedia Ras" : "Tambah Catpedia Ras"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Data ini tersimpan ke database dan langsung dipakai Customer App.
              </p>
            </div>

            {formError && (
              <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-b px-6 pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    "rounded-t-md px-3 py-2 text-sm font-semibold " +
                    (activeTab === tab.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextField
                      required
                      label="Nama Ras"
                      value={form.name}
                      onChange={(name) =>
                        setForm({
                          ...form,
                          name,
                          slug: editingId ? form.slug : generateSlug(name),
                        })
                      }
                    />
                    <TextField
                      required
                      label="Slug"
                      value={form.slug}
                      onChange={(slug) =>
                        setForm({ ...form, slug: generateSlug(slug) })
                      }
                    />
                    <TextField
                      label="Asal"
                      value={form.origin}
                      onChange={(origin) => setForm({ ...form, origin })}
                    />
                    <TextField
                      label="Nama alternatif (pisahkan koma)"
                      value={form.alternativeNames}
                      onChange={(alternativeNames) =>
                        setForm({ ...form, alternativeNames })
                      }
                    />
                    <TextField
                      label="URL gambar utama"
                      value={form.imageSrc}
                      onChange={(imageSrc) => setForm({ ...form, imageSrc })}
                    />
                    <TextField
                      label="URL backdrop"
                      value={form.backdropImageSrc}
                      onChange={(backdropImageSrc) =>
                        setForm({ ...form, backdropImageSrc })
                      }
                    />
                    <TextField
                      label="Ukuran"
                      value={form.sizeLabel}
                      onChange={(sizeLabel) => setForm({ ...form, sizeLabel })}
                    />
                    <TextField
                      label="Harapan hidup"
                      value={form.lifeExpectancy}
                      onChange={(lifeExpectancy) =>
                        setForm({ ...form, lifeExpectancy })
                      }
                    />
                    <TextField
                      label="Berat jantan"
                      value={form.maleWeightRange}
                      onChange={(maleWeightRange) =>
                        setForm({ ...form, maleWeightRange })
                      }
                    />
                    <TextField
                      label="Berat betina"
                      value={form.femaleWeightRange}
                      onChange={(femaleWeightRange) =>
                        setForm({ ...form, femaleWeightRange })
                      }
                    />
                    <TextField
                      label="Panjang bulu"
                      value={form.coatLength}
                      onChange={(coatLength) =>
                        setForm({ ...form, coatLength })
                      }
                    />
                    <TextField
                      label="Pola bulu"
                      value={form.coatPatterns}
                      onChange={(coatPatterns) =>
                        setForm({ ...form, coatPatterns })
                      }
                    />
                    <TextField
                      label="Aktivitas"
                      value={form.activityLevel}
                      onChange={(activityLevel) =>
                        setForm({ ...form, activityLevel })
                      }
                    />
                    <TextField
                      label="Vokal"
                      value={form.vocalLevel}
                      onChange={(vocalLevel) =>
                        setForm({ ...form, vocalLevel })
                      }
                    />
                    <TextField
                      label="Cocok indoor"
                      value={form.indoorFit}
                      onChange={(indoorFit) => setForm({ ...form, indoorFit })}
                    />
                    <TextField
                      label="Level perawatan lama"
                      value={form.careLevel}
                      onChange={(careLevel) => setForm({ ...form, careLevel })}
                    />
                  </div>
                  <TextareaField
                    label="Short description"
                    value={form.shortDescription}
                    onChange={(shortDescription) =>
                      setForm({ ...form, shortDescription })
                    }
                    rows={2}
                  />
                  <TextareaField
                    label="Ringkasan profil"
                    value={form.profileSummary}
                    onChange={(profileSummary) =>
                      setForm({ ...form, profileSummary })
                    }
                  />
                  <TextareaField
                    label="Sejarah"
                    value={form.history}
                    onChange={(history) => setForm({ ...form, history })}
                  />
                  <TextareaField
                    label="Deskripsi personality"
                    value={form.personalityDescription}
                    onChange={(personalityDescription) =>
                      setForm({ ...form, personalityDescription })
                    }
                  />
                  <TextareaField
                    label="Karakteristik (pisahkan koma)"
                    value={form.characteristics}
                    onChange={(characteristics) =>
                      setForm({ ...form, characteristics })
                    }
                    rows={2}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <CheckboxField
                      label="Published"
                      checked={form.isPublished}
                      onChange={(isPublished) =>
                        setForm({ ...form, isPublished })
                      }
                    />
                    <CheckboxField
                      label="Featured"
                      checked={form.isFeatured}
                      onChange={(isFeatured) =>
                        setForm({ ...form, isFeatured })
                      }
                    />
                    <TextField
                      type="date"
                      label="Tanggal update konten"
                      value={form.contentUpdatedAt}
                      onChange={(contentUpdatedAt) =>
                        setForm({ ...form, contentUpdatedAt })
                      }
                    />
                    <TextField
                      type="date"
                      label="Tanggal update komersial"
                      value={form.commercialUpdatedAt}
                      onChange={(commercialUpdatedAt) =>
                        setForm({ ...form, commercialUpdatedAt })
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "scores" && (
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Cocok pemula", "beginnerFitScore"],
                    ["Aktivitas", "activityScore"],
                    ["Keramahan", "friendlinessScore"],
                    ["Perawatan bulu", "groomingScore"],
                    ["Vokal", "vocalScore"],
                    ["Adaptasi", "adaptabilityScore"],
                    ["Cocok anak", "childFriendlyScore"],
                    ["Cocok hewan lain", "petFriendlyScore"],
                  ].map(([label, key]) => (
                    <TextField
                      key={key}
                      type="number"
                      label={`${label} (1-10)`}
                      value={form[key as keyof FormState] as string}
                      onChange={(value) => setForm({ ...form, [key]: value })}
                    />
                  ))}
                  <TextareaField
                    label="Catatan sumber"
                    value={form.sourceNotes}
                    onChange={(sourceNotes) =>
                      setForm({ ...form, sourceNotes })
                    }
                    className="md:col-span-2"
                  />
                </div>
              )}

              {activeTab === "care" && (
                <div className="space-y-5">
                  <SectionHeading title="Kebutuhan Perawatan" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextareaField
                      label="Frekuensi menyisir"
                      value={form.brushingFrequency}
                      onChange={(brushingFrequency) =>
                        setForm({ ...form, brushingFrequency })
                      }
                    />
                    <TextareaField
                      label="Mandi"
                      value={form.bathing}
                      onChange={(bathing) => setForm({ ...form, bathing })}
                    />
                    <TextareaField
                      label="Perawatan mata"
                      value={form.eyeCare}
                      onChange={(eyeCare) => setForm({ ...form, eyeCare })}
                    />
                    <TextareaField
                      label="Perawatan telinga"
                      value={form.earCare}
                      onChange={(earCare) => setForm({ ...form, earCare })}
                    />
                    <TextareaField
                      label="Kuku"
                      value={form.nailCare}
                      onChange={(nailCare) => setForm({ ...form, nailCare })}
                    />
                    <TextareaField
                      label="Dental care"
                      value={form.dentalCare}
                      onChange={(dentalCare) =>
                        setForm({ ...form, dentalCare })
                      }
                    />
                    <TextField
                      label="Tingkat kerontokan"
                      value={form.sheddingLevel}
                      onChange={(sheddingLevel) =>
                        setForm({ ...form, sheddingLevel })
                      }
                    />
                    <TextField
                      label="Risiko hairball"
                      value={form.hairballRisk}
                      onChange={(hairballRisk) =>
                        setForm({ ...form, hairballRisk })
                      }
                    />
                  </div>
                  <TextareaField
                    label="Catatan grooming"
                    value={form.careNotes}
                    onChange={(careNotes) => setForm({ ...form, careNotes })}
                  />

                  <SectionHeading title="Nutrisi" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextareaField
                      label="Life stage"
                      value={form.lifeStageNotes}
                      onChange={(lifeStageNotes) =>
                        setForm({ ...form, lifeStageNotes })
                      }
                    />
                    <TextareaField
                      label="Protein"
                      value={form.proteinNotes}
                      onChange={(proteinNotes) =>
                        setForm({ ...form, proteinNotes })
                      }
                    />
                    <TextareaField
                      label="Hidrasi"
                      value={form.hydrationNotes}
                      onChange={(hydrationNotes) =>
                        setForm({ ...form, hydrationNotes })
                      }
                    />
                    <TextareaField
                      label="Kontrol porsi"
                      value={form.portionNotes}
                      onChange={(portionNotes) =>
                        setForm({ ...form, portionNotes })
                      }
                    />
                    <TextField
                      label="Risiko obesitas"
                      value={form.obesityRisk}
                      onChange={(obesityRisk) =>
                        setForm({ ...form, obesityRisk })
                      }
                    />
                    <TextareaField
                      label="Kebutuhan khusus"
                      value={form.specialNeeds}
                      onChange={(specialNeeds) =>
                        setForm({ ...form, specialNeeds })
                      }
                    />
                  </div>
                  <TextareaField
                    label="Kebutuhan makanan legacy"
                    value={form.foodType}
                    onChange={(foodType) => setForm({ ...form, foodType })}
                    rows={2}
                  />
                </div>
              )}

              {activeTab === "health" && (
                <div className="space-y-5">
                  <TextareaField
                    label="Health notes"
                    helper="Satu baris per item: judul | deskripsi | severity | monitoring tips"
                    value={form.healthNotes}
                    onChange={(healthNotes) =>
                      setForm({ ...form, healthNotes })
                    }
                    rows={7}
                  />
                  <TextareaField
                    label="Cocok untuk"
                    helper="Satu baris per item: label | deskripsi"
                    value={form.goodFor}
                    onChange={(goodFor) => setForm({ ...form, goodFor })}
                    rows={5}
                  />
                  <TextareaField
                    label="Perlu dipertimbangkan jika"
                    helper="Satu baris per item: label | deskripsi"
                    value={form.considerIf}
                    onChange={(considerIf) =>
                      setForm({ ...form, considerIf })
                    }
                    rows={5}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextField
                      label="Ketersediaan"
                      value={form.availability}
                      onChange={(availability) =>
                        setForm({ ...form, availability })
                      }
                    />
                    <TextField
                      label="Label kecocokan"
                      value={form.matchLabel}
                      onChange={(matchLabel) =>
                        setForm({ ...form, matchLabel })
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-5">
                  <SectionHeading title="Estimasi Biaya" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextField
                      label="Biaya awal"
                      value={form.initialCostLabel}
                      onChange={(initialCostLabel) =>
                        setForm({ ...form, initialCostLabel })
                      }
                    />
                    <TextField
                      label="Biaya bulanan"
                      value={form.costMonthlyLabel}
                      onChange={(costMonthlyLabel) =>
                        setForm({ ...form, costMonthlyLabel })
                      }
                    />
                    <TextField
                      label="Grooming"
                      value={form.groomingCostLabel}
                      onChange={(groomingCostLabel) =>
                        setForm({ ...form, groomingCostLabel })
                      }
                    />
                    <TextField
                      label="Vaksin & check-up"
                      value={form.vaccineCheckupLabel}
                      onChange={(vaccineCheckupLabel) =>
                        setForm({ ...form, vaccineCheckupLabel })
                      }
                    />
                    <TextField
                      label="Starter kit"
                      value={form.starterKitLabel}
                      onChange={(starterKitLabel) =>
                        setForm({ ...form, starterKitLabel })
                      }
                    />
                    <TextField
                      label="Area/kota"
                      value={form.cityLabel}
                      onChange={(cityLabel) => setForm({ ...form, cityLabel })}
                    />
                    <TextField
                      label="Harga kitten legacy"
                      value={form.kittenPriceLabel}
                      onChange={(kittenPriceLabel) =>
                        setForm({ ...form, kittenPriceLabel })
                      }
                    />
                    <TextField
                      label="Biaya bulanan legacy"
                      value={form.monthlyCareLabel}
                      onChange={(monthlyCareLabel) =>
                        setForm({ ...form, monthlyCareLabel })
                      }
                    />
                  </div>
                  <TextareaField
                    label="Catatan biaya"
                    value={form.costNotes}
                    onChange={(costNotes) => setForm({ ...form, costNotes })}
                  />

                  <TextareaField
                    label="Galeri"
                    helper="Satu baris per gambar: url | type(main/backdrop/face/full_body/kitten/adult/color_variant/other) | alt | credit | sourceUrl"
                    value={form.galleryImages}
                    onChange={(galleryImages) =>
                      setForm({ ...form, galleryImages })
                    }
                    rows={5}
                  />
                  <TextareaField
                    label="Warna dan pola"
                    helper="Satu baris per item: nama | deskripsi | imageUrl"
                    value={form.colorPatterns}
                    onChange={(colorPatterns) =>
                      setForm({ ...form, colorPatterns })
                    }
                    rows={5}
                  />
                  <TextareaField
                    label="Ras serupa"
                    helper={`Satu baris per item: slug ras | alasan. Slug tersedia: ${breedOptions
                      .slice(0, 10)
                      .map((item) => item.slug)
                      .join(", ")}`}
                    value={form.similarBreeds}
                    onChange={(similarBreeds) =>
                      setForm({ ...form, similarBreeds })
                    }
                    rows={5}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="border-b pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
      {title}
    </h3>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 3,
  helper,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  helper?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input"
        rows={rows}
      />
      {helper && <span className="mt-1 block text-xs text-gray-500">{helper}</span>}
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
