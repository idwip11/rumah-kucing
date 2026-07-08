"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Bot, Send, UserRound } from "lucide-react";
import { CatProfileCard } from "@/components/cat-profile-card";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { chatSeeds, recommendedProducts } from "@/lib/mock-data";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(chatSeeds as Message[]);
  const [draft, setDraft] = useState("");

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;

    const userMessage: Message = { role: "user", content: draft.trim() };
    const aiMessage: Message = {
      role: "assistant",
      content:
        "Ketty AI mencatat keluhan ini. Untuk triage awal: cek frekuensi, energi, nafsu makan, minum, dan litter box. Jika muntah berulang, tidak mau makan lebih dari 12 jam, tampak nyeri, atau ada darah, segera hubungi dokter hewan."
    };

    setMessages((current) => [...current, userMessage, aiMessage]);
    setDraft("");
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
      <aside className="space-y-4">
        <CatProfileCard compact />
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-800">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold">Batas aman Ketty AI</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ketty AI membantu edukasi dan triage awal, bukan pengganti diagnosis dokter hewan.
                Kondisi darurat tetap perlu klinik.
              </p>
            </div>
          </div>
        </section>
        <section>
          <p className="mb-3 text-sm font-bold text-primary">Rekomendasi setelah konsultasi</p>
          <div className="space-y-3">
            {recommendedProducts.slice(0, 2).map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </section>
      </aside>

      <section className="flex min-h-[680px] flex-col rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <p className="text-sm font-bold text-primary">Ketty AI</p>
          <h1 className="mt-1 text-2xl font-bold">Smart assistant perawatan kucing</h1>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            const Icon = isAssistant ? Bot : UserRound;
            return (
              <div className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`} key={`${message.role}-${index}`}>
                {isAssistant && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
                <div
                  className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 ${
                    isAssistant ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
                {!isAssistant && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tulis gejala, kebiasaan, atau pertanyaan..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" size="icon" aria-label="Kirim pesan">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
