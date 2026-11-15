import type { ReactNode } from "react";
import { Button } from "./Button";

export function Spinner({ size = "md" }: { size?: "md" | "lg" }) {
  return <span className={`spinner${size === "lg" ? " spinner-lg" : ""}`} role="status" aria-label="Loading" />;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="state-block">
      <Spinner size="lg" />
      <span className="state-desc">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="state-block">
      <div className="state-title">{title}</div>
      {description ? <p className="state-desc">{description}</p> : null}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-banner" role="alert">
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry ? (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="full-page-center">
      <Spinner size="lg" />
    </div>
  );
}

export function Card({ children, title, actions }: { children: ReactNode; title?: string; actions?: ReactNode }) {
  return (
    <div className="card">
      {title ? (
        <div className="card-header">
          <span className="card-title">{title}</span>
          {actions}
        </div>
      ) : null}
      <div className="card-padded">{children}</div>
    </div>
  );
}
