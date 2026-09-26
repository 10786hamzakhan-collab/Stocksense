import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocStatus, MoveType, StockState } from "@/lib/inventory";
import { Loader2, PackageSearch } from "lucide-react";
import type { ReactNode } from "react";

const STATUS_STYLES: Record<DocStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  waiting: "bg-warning/15 text-warning-foreground border-warning/30",
  ready: "bg-info/15 text-info border-info/30",
  done: "bg-success/15 text-success border-success/30",
  canceled: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusBadge({ status }: { status: DocStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

const STOCK_STYLES: Record<StockState, { label: string; className: string }> = {
  in_stock: { label: "In stock", className: "bg-success/15 text-success border-success/30" },
  low: { label: "Low stock", className: "bg-warning/20 text-warning-foreground border-warning/40" },
  out: { label: "Out of stock", className: "bg-destructive/10 text-destructive border-destructive/25" },
};

export function StockBadge({ state }: { state: StockState }) {
  const s = STOCK_STYLES[state];
  return (
    <Badge variant="outline" className={cn("font-medium", s.className)}>
      {s.label}
    </Badge>
  );
}

const MOVE_STYLES: Record<MoveType, string> = {
  receipt: "bg-success/15 text-success border-success/30",
  delivery: "bg-info/15 text-info border-info/30",
  transfer: "bg-primary/10 text-primary border-primary/25",
  adjustment: "bg-warning/20 text-warning-foreground border-warning/40",
};

export function MoveTypeBadge({ type }: { type: MoveType }) {
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", MOVE_STYLES[type])}>
      {type}
    </Badge>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function LoadingBlock({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function InlineSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-accent p-3 text-accent-foreground">
        <PackageSearch className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-semibold text-destructive">Something went wrong</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
