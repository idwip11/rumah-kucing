import { cn } from "@/lib/utils";

type WelcomeCardProps = {
  name: string;
  className?: string;
};

export default function WelcomeCard({ name, className }: WelcomeCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-lg font-medium text-foreground">Welcome, {name}</p>
    </div>
  );
}
