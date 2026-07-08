import { type LucideIcon } from "lucide-react";

type TimelineEventProps = {
  title: string;
  date: string;
  description: string;
  icon: LucideIcon;
  status: string;
};

export function TimelineEvent({ title, date, description, icon: Icon, status }: TimelineEventProps) {
  return (
    <article className="relative pl-12">
      <span className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold">{title}</h3>
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
            {status}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-primary">{date}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}
