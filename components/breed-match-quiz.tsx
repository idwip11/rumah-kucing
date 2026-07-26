"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckCircle2,
  Clock,
  Home,
  Info,
  PawPrint,
  RotateCcw,
  Scissors,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import {
  getBreedQuizResults,
  type BreedQuizAnswers,
  type BreedQuizInput,
} from "@/lib/catpedia/quiz";

type QuestionId = keyof BreedQuizAnswers;

type Question = {
  id: QuestionId;
  title: string;
  description: string;
  icon: typeof Home;
  options: Array<{
    value: BreedQuizAnswers[QuestionId];
    label: string;
    description: string;
  }>;
};

const questions: Question[] = [
  {
    id: "home",
    title: "Tempat tinggal kamu seperti apa?",
    description: "Ini membantu menilai kecocokan ruang dan gaya hidup indoor.",
    icon: Home,
    options: [
      {
        value: "apartment",
        label: "Apartemen atau rumah kecil",
        description: "Ruang lebih terbatas dan aktivitas perlu mudah dikelola.",
      },
      {
        value: "house",
        label: "Rumah lebih luas",
        description: "Ada lebih banyak ruang untuk eksplorasi dan bermain.",
      },
    ],
  },
  {
    id: "away",
    title: "Berapa lama rumah biasanya kosong?",
    description: "Beberapa ras butuh interaksi lebih sering dibanding yang lain.",
    icon: Clock,
    options: [
      {
        value: "short",
        label: "Jarang kosong",
        description: "Ada orang di rumah hampir sepanjang hari.",
      },
      {
        value: "medium",
        label: "4-7 jam per hari",
        description: "Rutinitas kerja atau sekolah cukup normal.",
      },
      {
        value: "long",
        label: "Lebih dari 8 jam",
        description: "Butuh ras yang lebih mandiri dan enrichment yang jelas.",
      },
    ],
  },
  {
    id: "energy",
    title: "Kamu lebih suka kucing seperti apa?",
    description: "Pilih energi yang paling nyaman untuk rutinitasmu.",
    icon: Zap,
    options: [
      {
        value: "calm",
        label: "Tenang",
        description: "Lebih suka teman yang kalem dan tidak terlalu intens.",
      },
      {
        value: "balanced",
        label: "Seimbang",
        description: "Ada waktu bermain, tapi tidak terlalu menuntut.",
      },
      {
        value: "active",
        label: "Aktif",
        description: "Siap bermain, melatih, dan memberi stimulasi harian.",
      },
    ],
  },
  {
    id: "grooming",
    title: "Seberapa siap kamu untuk grooming?",
    description: "Panjang bulu dan kerontokan bisa memengaruhi rutinitas.",
    icon: Scissors,
    options: [
      {
        value: "low",
        label: "Seringan mungkin",
        description: "Saya ingin perawatan bulu yang simpel.",
      },
      {
        value: "medium",
        label: "Sedang",
        description: "Saya siap menyisir rutin beberapa kali seminggu.",
      },
      {
        value: "high",
        label: "Siap intensif",
        description: "Saya nyaman dengan grooming yang lebih sering.",
      },
    ],
  },
  {
    id: "children",
    title: "Apakah ada anak kecil di rumah?",
    description: "Temperamen dan adaptasi perlu dipertimbangkan.",
    icon: Baby,
    options: [
      {
        value: "yes",
        label: "Ada",
        description: "Saya butuh ras yang cenderung ramah keluarga.",
      },
      {
        value: "no",
        label: "Tidak ada",
        description: "Tidak perlu prioritas khusus untuk anak kecil.",
      },
    ],
  },
  {
    id: "pets",
    title: "Apakah sudah ada hewan lain?",
    description: "Beberapa ras lebih mudah beradaptasi secara sosial.",
    icon: PawPrint,
    options: [
      {
        value: "yes",
        label: "Ada",
        description: "Saya perlu mempertimbangkan proses introduksi.",
      },
      {
        value: "no",
        label: "Belum ada",
        description: "Kucing baru akan menjadi hewan utama di rumah.",
      },
    ],
  },
  {
    id: "budget",
    title: "Kisaran budget bulanan kamu?",
    description: "Budget membantu menimbang grooming, makanan, dan kebutuhan rutin.",
    icon: Wallet,
    options: [
      {
        value: "low",
        label: "Lebih hemat",
        description: "Saya ingin kebutuhan bulanan tetap terkendali.",
      },
      {
        value: "medium",
        label: "Sedang",
        description: "Saya siap untuk kebutuhan rutin yang wajar.",
      },
      {
        value: "high",
        label: "Fleksibel",
        description: "Saya siap jika biaya perawatan lebih tinggi.",
      },
    ],
  },
  {
    id: "firstCat",
    title: "Apakah ini kucing pertamamu?",
    description: "Pemilik pertama biasanya terbantu oleh ras yang lebih adaptif.",
    icon: Sparkles,
    options: [
      {
        value: "yes",
        label: "Ya, pertama",
        description: "Saya ingin pilihan yang mudah dipelajari.",
      },
      {
        value: "no",
        label: "Bukan",
        description: "Saya sudah punya pengalaman merawat kucing.",
      },
    ],
  },
];

const initialAnswers: Partial<BreedQuizAnswers> = {};

function isComplete(answers: Partial<BreedQuizAnswers>): answers is BreedQuizAnswers {
  return questions.every((question) => answers[question.id]);
}

export function BreedMatchQuiz({ breeds }: { breeds: BreedQuizInput[] }) {
  const [answers, setAnswers] =
    useState<Partial<BreedQuizAnswers>>(initialAnswers);
  const [step, setStep] = useState(0);

  const currentQuestion = questions[step];
  const completed = isComplete(answers);
  const results = useMemo(
    () => (completed ? getBreedQuizResults(breeds, answers) : []),
    [answers, breeds, completed],
  );
  const progress = Math.round(
    (Object.keys(answers).length / questions.length) * 100,
  );
  const compareHref = `/breeds/compare?ids=${results
    .map((result) => result.breed.slug)
    .join(",")}`;

  function selectAnswer(
    questionId: QuestionId,
    value: BreedQuizAnswers[QuestionId],
  ) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    if (step < questions.length - 1) {
      setStep((current) => current + 1);
    }
  }

  function resetQuiz() {
    setAnswers(initialAnswers);
    setStep(0);
  }

  if (breeds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/75 px-6 py-12 text-center shadow-soft">
        <PawPrint className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 font-headline text-[24px] font-extrabold text-ink">
          Data ras belum tersedia
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
          Quiz membutuhkan data Catpedia yang sudah dipublikasikan oleh admin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-2xl border border-border/75 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-extrabold uppercase text-primary">
              Pertanyaan {step + 1} dari {questions.length}
            </p>
            <div className="mt-2 h-2 w-44 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={resetQuiz}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-[12px] font-bold text-on-surface-variant hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Ulangi
          </button>
        </div>

        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <currentQuestion.icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-headline text-[26px] font-extrabold leading-tight text-ink">
              {currentQuestion.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {currentQuestion.description}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {currentQuestion.options.map((option) => {
            const selected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectAnswer(currentQuestion.id, option.value)}
                className={
                  "rounded-2xl border p-4 text-left transition-all " +
                  (selected
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border/75 bg-white hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm")
                }
              >
                <span className="flex items-center gap-3">
                  <span
                    className={
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border " +
                      (selected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-transparent")
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-headline text-[18px] font-bold text-ink">
                    {option.label}
                  </span>
                </span>
                <span className="mt-2 block pl-10 text-sm leading-relaxed text-on-surface-variant">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-[12px] font-bold text-on-surface-variant hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() =>
              setStep((current) => Math.min(questions.length - 1, current + 1))
            }
            disabled={step === questions.length - 1}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-[12px] font-bold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Berikutnya
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/75 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-5">
          <p className="eyebrow mb-2">Hasil sementara</p>
          <h2 className="font-headline text-[27px] font-extrabold text-ink">
            {completed ? "Tiga ras yang mungkin cocok" : "Jawab semua pertanyaan"}
          </h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-on-surface-variant">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Skor adalah kecocokan preferensi berdasarkan jawaban kamu dan data
            Catpedia, bukan kepastian sifat setiap individu kucing.
          </p>
        </div>

        {completed ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <article
                key={result.breed.id}
                className="overflow-hidden rounded-2xl border border-border/75 bg-surface-card"
              >
                <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="relative min-h-[180px] bg-muted">
                    {result.breed.imageSrc ? (
                      <Image
                        src={result.breed.imageSrc}
                        alt={`Foto ras ${result.breed.name}`}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[180px] items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[32px]">
                          pets
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase text-primary">
                          Pilihan {index + 1}
                        </p>
                        <h3 className="mt-1 font-headline text-[23px] font-extrabold text-ink">
                          {result.breed.name}
                        </h3>
                      </div>
                      <span className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-extrabold text-white">
                        {result.score}% preferensi
                      </span>
                    </div>

                    <ul className="mt-4 grid gap-2 text-sm font-semibold text-ink">
                      {result.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 rounded-xl border border-honey/30 bg-honey/10 px-3 py-2 text-[12px] font-semibold leading-relaxed text-ink">
                      Perlu dipertimbangkan: {result.cautions.join(" ")}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/breeds/${result.breed.slug}`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[12px] font-bold text-white hover:bg-primary-container"
                      >
                        Lihat Profil
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={compareHref}
                className="btn-bounce inline-flex h-11 items-center gap-2 rounded-xl border border-primary/25 bg-white px-4 text-[13px] font-bold text-primary hover:bg-primary/5"
              >
                Bandingkan hasil ini
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/breeds"
                className="btn-bounce inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-[13px] font-bold text-on-surface-variant hover:bg-muted"
              >
                Jelajahi Catpedia
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/35 px-5 py-10 text-center">
            <Sparkles
              className="mx-auto h-9 w-9 text-primary"
              aria-hidden="true"
            />
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
              Setelah semua jawaban lengkap, Rumah Kucing akan menampilkan tiga
              ras yang paling selaras dengan preferensimu.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
