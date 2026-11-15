import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { login } from "../auth/authStore";
import { getErrorMessage } from "../lib/errors";
import { Button, Field, Input } from "../components/ui";
import { useT } from "../i18n/LocaleContext";

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  const [email, setEmail] = useState("owner@demo.test");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    const from = (location.state as LocationState | null)?.from?.pathname ?? "/catalog";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/catalog", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="brand-mark" style={{ width: 40, height: 40, fontSize: 18, borderRadius: 12 }}>
            M
          </span>
          <div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{t("admin.appName")}</h1>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginTop: 4 }}>
              {t("admin.signInHint")}
            </p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error ? (
            <div className="error-banner" role="alert">
              {error}
            </div>
          ) : null}

          <Field label={t("checkout.email")} htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label={t("account.password")} htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" variant="primary" block disabled={submitting}>
            {submitting ? `${t("admin.signIn")}…` : t("admin.signIn")}
          </Button>
        </form>

        <p className="login-hint">
          Demo staff login is pre-filled: <span className="mono">owner@demo.test</span> /{" "}
          <span className="mono">password123</span>
        </p>
      </div>
    </div>
  );
}
