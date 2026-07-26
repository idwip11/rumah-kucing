"use client";

import { useState, useRef } from "react";
import {
  CalendarDays,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  type: string;
  eventDate: Date;
  location: string;
  description: string | null;
  sourceUrl: string | null;
};

export function UpcomingEventsCarousel({ events }: { events: EventItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const visibleCount = 4;
  const visibleEvents = events.slice(0, visibleCount);
  const carouselEvents = events.slice(visibleCount);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scrollBy = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = 340; // approximate card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 300);
  };

  return (
    <div>
      {/* First 4 events in a grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Carousel for remaining events */}
      {carouselEvents.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-[18px] font-bold text-on-surface">
              Event lainnya
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollBy("left")}
                disabled={!canScrollLeft}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d1d5d2] bg-white text-on-surface-variant hover:bg-[#f9f9f9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Geser ke kiri"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy("right")}
                disabled={!canScrollRight}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d1d5d2] bg-white text-on-surface-variant hover:bg-[#f9f9f9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Geser ke kanan"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={updateScrollButtons}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 -mx-2 px-2 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5d2 transparent",
            }}
          >
            {carouselEvents.map((event) => (
              <div
                key={event.id}
                className="min-w-[300px] max-w-[340px] flex-shrink-0 snap-start"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="premium-card card-hover flex h-full flex-col rounded-[22px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="rounded-full bg-rose/65 px-3 py-1.5 text-[11px] font-bold text-secondary">
          {event.type}
        </span>
        <span className="flex items-center gap-1.5 text-[13px] font-bold text-on-surface-variant">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(event.eventDate))}
        </span>
      </div>
      <h3 className="font-headline text-[20px] font-bold text-on-surface mb-1">
        {event.title}
      </h3>
      <p className="text-[13px] font-bold text-primary mb-3">
        {event.location}
      </p>
      <p className="text-[14px] leading-relaxed text-on-surface-variant flex-grow">
        {event.description}
      </p>
      {event.sourceUrl && (
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
        >
          Sumber info
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </article>
  );
}
