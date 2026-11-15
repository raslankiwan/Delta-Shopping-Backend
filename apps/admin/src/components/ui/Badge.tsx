import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "danger" | "warning" | "accent";

const STATUS_TONE: Record<string, Tone> = {
  active: "success",
  paid: "success",
  fulfilled: "success",
  completed: "success",
  succeeded: "success",
  draft: "neutral",
  pending: "warning",
  partially_fulfilled: "warning",
  partially_paid: "warning",
  processing: "warning",
  awaiting_payment: "warning",
  archived: "neutral",
  cancelled: "danger",
  canceled: "danger",
  refunded: "danger",
  failed: "danger",
  voided: "danger",
  unfulfilled: "neutral",
  disabled: "danger",
};

function toneFor(status: string): Tone {
  return STATUS_TONE[status.toLowerCase()] ?? "neutral";
}

export function StatusBadge({ status }: { status: string }) {
  const tone = toneFor(status);
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
