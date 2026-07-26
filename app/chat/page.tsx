"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, Cat, Send, Sparkles, UserRound } from "lucide-react";
import { CatProfileCard } from "@/components/cat-profile-card";
import { ProductCard } from "@/components/product-card";
import { ChatMessageContent } from "@/components/chat-message-content";
import { Button } from "@/components/ui/button";
import { recommendedProducts } from "@/lib/mock-data";
import { useCatStore } from "@/store/use-cat-store";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: `Halo! **Ketty AI** siap membantu perawatan kucing Anda.

Saya siap membantu menjawab berbagai pertanyaan seputar:

- **Profil & Ras Kucing**: Karakteristik ras, usia, berat, dan gaya hidup anabul Anda.
- **Jadwal & Timeline Anabul Anda**: Grafik berat badan, riwayat medis, dan grooming.
- **Prestasi & Pencapaian**: Daftar gelar, kompetisi, dan penghargaan kucing kesayangan.
- **Katalog Produk**: Rekomendasi makanan, suplemen kesehatan, mainan, dan aksesori.
- **Riwayat Pesanan**: Detail status pesanan dan produk yang pernah dibeli.
- **Event & Acara**: Informasi pameran, kompetisi, dan acara komunitas kucing terkini.
- **Artikel Edukasi**: Panduan lengkap dan tips perawatan harian.

> **Catatan:** Ada yang ingin Anda tanyakan hari ini? *(Untuk mengubah atau menambah data, silakan gunakan menu utama aplikasi).*`,
  },
];

const SUGGESTED_PROMPTS = [
  "Berapa berat ideal kucing saya?",
  "Tampilkan jadwal kesehatan terbaru",
  "Ada event kucing apa bulan ini?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeCatId = useCatStore((state) => state.activeCatId);
  const hasAppliedTopic = useRef(false);

  useEffect(() => {
    if (hasAppliedTopic.current) return;
    hasAppliedTopic.current = true;

    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic?.trim()) {
      setDraft(topic.trim());
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  async function handleSend(textToSend: string) {
    const text = textToSend.trim();
    if (!text || isSending) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: nextMessages, activeCatId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.debug?.message ||
            `Chat request failed with status ${response.status}`,
        );
      }

      if (!data?.reply) {
        throw new Error(data?.error || "Ketty AI tidak mengembalikan jawaban.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Ketty AI belum berhasil memproses pertanyaan ini.\n\n> Detail teknis: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSend(draft);
  }

  return (
    <div className="flex-grow px-4 sm:px-6 md:px-[80px] py-4 sm:py-6 md:py-[64px] max-w-[1440px] mx-auto w-full pt-[80px] sm:pt-[100px] md:pt-[120px]">
      {/* Mobile: stack sidebar above/below chat. Desktop: sidebar left, chat right */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10 xl:lg:gap-14">
        {/* Sidebar - hidden on very small screens, shown on sm+ */}
        <aside className="flex flex-col gap-4 sm:gap-6 lg:col-span-4 xl:col-span-4 order-2 lg:order-1">
          <CatProfileCard compact />

          <section className="premium-card rounded-[20px] p-4 sm:p-5">
            <div className="flex gap-2.5 sm:gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose text-secondary ring-1 ring-secondary/10">
                <AlertTriangle
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Batas aman Ketty AI
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Ketty AI membantu edukasi dan triage awal, bukan pengganti
                  diagnosis dokter hewan. Kondisi darurat tetap perlu klinik.
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="mb-2 sm:mb-3 text-sm font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Rekomendasi Produk
            </p>
            <div className="space-y-2.5 sm:space-y-3">
              {recommendedProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </section>
        </aside>

        {/* Chat section */}
        <section className="flex min-h-[500px] sm:min-h-[600px] md:min-h-[720px] h-auto flex-col lg:col-span-8 xl:col-span-8 order-1 lg:order-2">
          {/* Header */}
          <div className="mb-3 sm:mb-5 flex items-start justify-between gap-3 sm:gap-4 px-1 sm:px-2">
            <div className="max-w-full sm:max-w-2xl">
              <p className="eyebrow normal-case tracking-normal">Ketty AI</p>
              <h1 className="mt-1 font-headline text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Smart Assistant Perawatan Kucing
              </h1>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                Tanyakan profil, jadwal, prestasi, produk, pesanan, atau ras
                kucing berdasarkan data akun Anda.
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-[24px] border border-border/70 bg-[linear-gradient(145deg,hsl(var(--rose)/0.24),hsl(var(--card))_44%,hsl(var(--lavender)/0.22))] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:space-y-6 sm:px-7 sm:py-6 lg:px-8">
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";
              const Icon = isAssistant ? Cat : UserRound;
              return (
                <div
                  className={`flex gap-3 sm:gap-4 ${isAssistant ? "justify-start" : "justify-end"}`}
                  key={`${message.role}-${index}`}
                >
                  {isAssistant && (
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#875843] text-white shadow-[0_8px_18px_rgba(135,88,67,0.2)] sm:h-11 sm:w-11">
                      <Icon
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      />
                    </span>
                  )}

                  <div
                    className={`max-w-[84%] rounded-[20px] px-4 py-3.5 text-xs shadow-soft transition-all sm:max-w-[78%] sm:px-6 sm:py-5 sm:text-sm ${
                      isAssistant
                        ? "rounded-tl-md border border-border/70 bg-white text-foreground"
                        : "rounded-tr-md border border-primary/15 bg-primary/9 text-foreground"
                    }`}
                  >
                    <ChatMessageContent
                      content={message.content}
                      role={message.role}
                    />
                  </div>

                  {!isAssistant && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warm-gradient text-accent-foreground shadow-[0_7px_16px_hsl(var(--accent)/0.2)]">
                      <Icon
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3 sm:gap-4 justify-start">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#875843] text-white shadow-[0_8px_18px_rgba(135,88,67,0.2)] sm:h-11 sm:w-11">
                  <Cat className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1.5 rounded-[20px] rounded-tl-md border border-border/70 bg-white px-5 py-4 text-xs shadow-soft sm:text-sm">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="mt-3 sm:mt-5 space-y-2.5 sm:space-y-3 px-1 sm:px-2">
            {messages.length <= 3 && !isSending && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => handleSend(promptText)}
                    type="button"
                    className="btn-bounce touch-target-min rounded-full border border-border/70 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-foreground/80 shadow-sm hover:border-primary/20 hover:bg-primary/6 hover:text-primary sm:px-4 sm:py-2 sm:text-xs"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className="flex gap-2 rounded-[20px] border border-border/80 bg-white/95 p-2 shadow-[0_12px_32px_hsl(var(--secondary)/0.1)] focus-within:border-primary/30 sm:gap-3"
            >
              <input
                className="h-10 sm:h-12 min-w-0 flex-1 rounded-lg sm:rounded-2xl bg-transparent px-3 sm:px-4 text-xs sm:text-sm outline-none"
                placeholder="Tulis gejala, kebiasaan, atau pertanyaan..."
                value={draft}
                disabled={isSending}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isSending || !draft.trim()}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shrink-0 cursor-pointer touch-target-min"
                aria-label="Kirim pesan"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
