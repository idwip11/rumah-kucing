import type {
  CareInsight,
  DerivedCatProfile,
  RecommendationTimelineEvent,
  TimelineCareSignals,
} from "@/lib/recommendations/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(value: string | null | undefined) {
  return value
    ?.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase() ?? "";
}

function eventText(event: RecommendationTimelineEvent) {
  return normalize(
    [event.category, event.title, event.description].filter(Boolean).join(" "),
  );
}

function eventTime(event: RecommendationTimelineEvent) {
  const date =
    event.eventDate instanceof Date
      ? event.eventDate
      : new Date(event.eventDate);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysBetween(earlier: number, later: number) {
  return Math.max(
    0,
    Math.floor(
      (startOfDay(new Date(later)).getTime() -
        startOfDay(new Date(earlier)).getTime()) /
        DAY_MS,
    ),
  );
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function isCompletedPastEvent(
  event: RecommendationTimelineEvent,
  nowTime: number,
) {
  const time = eventTime(event);
  return (
    time !== null &&
    time <= nowTime &&
    normalize(event.status) !== "mendatang"
  );
}

function isTopic(
  event: RecommendationTimelineEvent,
  category: string,
  terms: string[],
) {
  const normalizedCategory = normalize(event.category).replace(/_/g, " ");
  return normalizedCategory === category || includesAny(eventText(event), terms);
}

function latestEvent(
  events: RecommendationTimelineEvent[],
  matcher: (event: RecommendationTimelineEvent) => boolean,
) {
  return events
    .filter(matcher)
    .sort((a, b) => (eventTime(b) ?? 0) - (eventTime(a) ?? 0))[0];
}

function extractWeights(event: RecommendationTimelineEvent) {
  const text = [event.title, event.description].filter(Boolean).join(" ");
  const matches = Array.from(
    text.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilogram)\b/gi),
  );

  return matches
    .map((match) => Number(match[1].replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0 && value < 40);
}

export function analyzeTimelineCareSignals(
  events: RecommendationTimelineEvent[],
  now = new Date(),
): TimelineCareSignals {
  const nowTime = now.getTime();
  const completedEvents = events.filter((event) =>
    isCompletedPastEvent(event, nowTime),
  );
  const withinDays = (event: RecommendationTimelineEvent, days: number) => {
    const time = eventTime(event);
    return time !== null && daysBetween(time, nowTime) <= days;
  };

  const groomingEvents = completedEvents.filter((event) =>
    isTopic(event, "grooming", ["grooming", "mandi", "sisir bulu"]),
  );
  const weightEvents = completedEvents.filter((event) =>
    isTopic(event, "berat badan", [
      "berat badan",
      "timbang",
      "bobot",
      " kg",
    ]),
  );
  const foodEvents = completedEvents.filter((event) =>
    isTopic(event, "makanan", [
      "makanan",
      "pakan",
      "dry food",
      "wet food",
      "kibble",
    ]),
  );
  const vaccineEvents = completedEvents.filter((event) =>
    isTopic(event, "vaksin", ["vaksin", "vaccin"]),
  );

  const latestGrooming = latestEvent(groomingEvents, () => true);
  const latestWeight = latestEvent(weightEvents, () => true);
  const recent30d = completedEvents.filter((event) => withinDays(event, 30));
  const recent45dFood = foodEvents.filter((event) => withinDays(event, 45));
  const recent90d = completedEvents.filter((event) => withinDays(event, 90));

  const weightMeasurements = weightEvents
    .flatMap((event) => {
      const time = eventTime(event);
      const values = extractWeights(event);
      return values.map((value, index) => ({
        value,
        time: time ?? 0,
        order: index,
        eventId: event.id,
      }));
    })
    .sort((a, b) => {
      if (b.time !== a.time) return b.time - a.time;
      return b.order - a.order;
    });

  const latestMeasurement = weightMeasurements[0] ?? null;
  const previousMeasurement = weightMeasurements.find((measurement, index) => {
    if (index === 0 || !latestMeasurement) return false;
    return (
      measurement.eventId !== latestMeasurement.eventId ||
      measurement.order < latestMeasurement.order
    );
  }) ?? null;

  const latestWeightTime = latestWeight ? eventTime(latestWeight) : null;
  const latestGroomingTime = latestGrooming
    ? eventTime(latestGrooming)
    : null;
  const weightChangeDays =
    latestMeasurement && previousMeasurement
      ? daysBetween(previousMeasurement.time, latestMeasurement.time)
      : null;

  return {
    lastGroomingAt: latestGrooming
      ? new Date(latestGroomingTime as number).toISOString()
      : null,
    daysSinceGrooming:
      latestGroomingTime !== null
        ? daysBetween(latestGroomingTime, nowTime)
        : null,
    lastWeightAt: latestWeight
      ? new Date(latestWeightTime as number).toISOString()
      : null,
    daysSinceWeight:
      latestWeightTime !== null ? daysBetween(latestWeightTime, nowTime) : null,
    latestWeightKg: latestMeasurement?.value ?? null,
    previousWeightKg: previousMeasurement?.value ?? null,
    weightChangeKg:
      latestMeasurement && previousMeasurement
        ? Number(
            (latestMeasurement.value - previousMeasurement.value).toFixed(2),
          )
        : null,
    weightChangeDays,
    hairballEvents30d: recent30d.filter((event) =>
      includesAny(eventText(event), [
        "hairball",
        "bola bulu",
        "muntah bulu",
      ]),
    ).length,
    recentIllnessEvents30d: recent30d.filter((event) => {
      const text = eventText(event);
      const isHairballOnly = includesAny(text, [
        "hairball",
        "bola bulu",
        "muntah bulu",
      ]);

      return (
        normalize(event.category).replace(/_/g, " ") === "riwayat sakit" ||
        (!isHairballOnly &&
          includesAny(text, [
            "riwayat sakit",
            "sedang sakit",
            "diare",
            "muntah",
            "nafsu makan berkurang",
            "tidak mau makan",
          ]))
      );
    }).length,
    recentFoodNotes45d: recent45dFood.length,
    recentDryFoodNotes45d: recent45dFood.filter((event) =>
      includesAny(eventText(event), [
        "dry food",
        "dryfood",
        "kibble",
        "makanan kering",
      ]),
    ).length,
    recentFoodChange: recent45dFood.some((event) =>
      includesAny(eventText(event), [
        "ganti makanan",
        "makanan baru",
        "pakan baru",
        "transisi",
        "beralih",
      ]),
    ),
    hydrationConcern: recent90d.some((event) =>
      includesAny(eventText(event), [
        "kurang minum",
        "jarang minum",
        "dehidrasi",
        "air minum sedikit",
      ]),
    ),
    urinaryConcern: recent90d.some((event) =>
      includesAny(eventText(event), [
        "urinary",
        "urin",
        "sulit kencing",
        "kencing sedikit",
        "darah di urine",
      ]),
    ),
    hasRecordedVaccine: vaccineEvents.length > 0,
  };
}

function formatGramChange(weightChangeKg: number) {
  return `${Math.round(Math.abs(weightChangeKg) * 1000)} gram`;
}

export function buildCareInsights(
  profile: DerivedCatProfile,
  signals: TimelineCareSignals,
): CareInsight[] {
  const insights: CareInsight[] = [];
  const name = profile.name;

  if (signals.hairballEvents30d >= 2) {
    insights.push({
      id: "repeated-hairball",
      category: "hairball",
      tone: "attention",
      title: "Hairball tercatat berulang",
      description: `${name} mengalami hairball ${signals.hairballEvents30d} kali dalam 30 hari terakhir. Tingkatkan frekuensi menyisir dan pantau apakah kejadian berulang.`,
      reason: "Berdasarkan catatan hairball 30 hari terakhir.",
      actionLabel: "Lihat catatan",
      href: "/timeline#timeline-records",
      priority: 100,
    });
  }

  if (signals.recentIllnessEvents30d > 0) {
    insights.push({
      id: "recent-health-history",
      category: "health",
      tone: "safety",
      title: "Pantau masa pemulihan",
      description: `Ada ${signals.recentIllnessEvents30d} catatan kondisi kesehatan ${name} dalam 30 hari terakhir. Pantau makan, minum, dan perilakunya; hubungi dokter hewan bila gejala menetap atau memburuk.`,
      reason: "Berdasarkan riwayat sakit terbaru di Timeline.",
      actionLabel: "Tinjau riwayat",
      href: "/timeline#timeline-records",
      priority: 95,
    });
  }

  if (
    signals.weightChangeKg !== null &&
    Math.abs(signals.weightChangeKg) >= 0.3
  ) {
    const increased = signals.weightChangeKg > 0;
    insights.push({
      id: "weight-change",
      category: "weight",
      tone: "attention",
      title: `Berat ${name} ${increased ? "bertambah" : "berkurang"}`,
      description: `Catatan timbang menunjukkan perubahan sekitar ${formatGramChange(signals.weightChangeKg)}. Evaluasi porsi makan dan aktivitas, lalu catat berat berikutnya untuk melihat polanya.`,
      reason: "Dihitung dari dua angka berat terbaru yang tersimpan.",
      actionLabel: "Catat berat baru",
      href: "/timeline#timeline-form",
      priority: 88,
    });
  }

  if (
    profile.coatLength === "long" &&
    (signals.daysSinceGrooming === null || signals.daysSinceGrooming > 10)
  ) {
    const hasGroomingRecord = signals.daysSinceGrooming !== null;
    insights.push({
      id: "grooming-due",
      category: "grooming",
      tone: "attention",
      title: "Sudah waktunya grooming",
      description: hasGroomingRecord
        ? `${name} terakhir grooming ${signals.daysSinceGrooming} hari lalu. Sisir bulunya lebih rutin untuk membantu mengangkat bulu mati dan mengurangi hairball.`
        : `Belum ada catatan grooming untuk ${name}. Tambahkan rutinitas menyisir agar perawatan bulu panjangnya lebih mudah dipantau.`,
      reason: hasGroomingRecord
        ? "Jarak grooming sudah lebih dari 10 hari."
        : "Profil bulu panjang belum memiliki riwayat grooming.",
      actionLabel: "Catat grooming",
      href: "/timeline#timeline-form",
      priority: 82,
    });
  }

  if (
    signals.daysSinceWeight === null ||
    signals.daysSinceWeight > 30
  ) {
    const hasWeightRecord = signals.daysSinceWeight !== null;
    insights.push({
      id: "weight-check-due",
      category: "weight",
      tone: "info",
      title: `Pantau berat badan ${name}`,
      description: hasWeightRecord
        ? `Belum ada catatan berat baru selama ${signals.daysSinceWeight} hari. Timbang kembali untuk memantau perubahan secara konsisten.`
        : `Belum ada hasil timbang di Timeline. Tambahkan berat terbaru agar perubahan kondisi ${name} bisa dipantau dari waktu ke waktu.`,
      reason: hasWeightRecord
        ? "Catatan berat terakhir sudah lebih dari 30 hari."
        : "Timeline belum memiliki catatan berat badan.",
      actionLabel: "Tambah catatan berat",
      href: "/timeline#timeline-form",
      priority: 74,
    });
  }

  if (signals.urinaryConcern) {
    insights.push({
      id: "urinary-signal",
      category: "health",
      tone: "safety",
      title: "Perhatikan catatan buang air kecil",
      description: `Timeline memuat sinyal terkait urin atau buang air kecil ${name}. Jangan memilih diet urinary atau obat secara mandiri; konsultasikan dengan dokter hewan.`,
      reason: "Berdasarkan kata kunci kondisi urinary pada catatan terbaru.",
      actionLabel: "Tinjau catatan",
      href: "/timeline#timeline-records",
      priority: 97,
    });
  } else if (
    signals.hydrationConcern ||
    signals.recentDryFoodNotes45d > 0
  ) {
    insights.push({
      id: "hydration-support",
      category: "hydration",
      tone: "info",
      title: "Dukung kebutuhan cairan",
      description: signals.hydrationConcern
        ? `Catatan terbaru menunjukkan ${name} perlu lebih diperhatikan asupan minumnya. Sediakan air bersih dan pertimbangkan wet food sebagai bagian dari pola makan harian.`
        : `${name} memiliki catatan makanan kering terbaru. Pastikan air bersih selalu tersedia dan pertimbangkan variasi makanan basah untuk membantu hidrasi.`,
      reason: "Berdasarkan catatan minum atau makanan terbaru.",
      actionLabel: "Lihat pilihan hidrasi",
      href: "/explore/products?tag=hydration",
      priority: 70,
    });
  }

  if (signals.recentFoodChange) {
    insights.push({
      id: "food-transition",
      category: "nutrition",
      tone: "info",
      title: "Pantau transisi makanan",
      description: `${name} memiliki catatan pergantian makanan dalam 45 hari terakhir. Lanjutkan transisi secara bertahap dan catat perubahan nafsu makan atau pencernaan.`,
      reason: "Berdasarkan catatan pergantian makanan terbaru.",
      actionLabel: "Lihat catatan makanan",
      href: "/timeline#timeline-records",
      priority: 66,
    });
  }

  if (!signals.hasRecordedVaccine) {
    insights.push({
      id: "vaccine-history-missing",
      category: "vaccination",
      tone: "info",
      title: "Riwayat vaksin belum tercatat",
      description: `Tambahkan riwayat vaksin ${name} agar jadwal berikutnya lebih mudah diingat. Konfirmasi jenis dan waktunya dengan dokter hewan.`,
      reason: "Belum ada vaksin berstatus tercatat di Timeline.",
      actionLabel: "Tambah riwayat vaksin",
      href: "/timeline#timeline-form",
      priority: 48,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}
