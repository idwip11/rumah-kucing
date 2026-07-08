import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SolutionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
};

export function SolutionCard({ title, description, href, icon: Icon, tone }: SolutionCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <span className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-md ring-1", tone)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Buka
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
