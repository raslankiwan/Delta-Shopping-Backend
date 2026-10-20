"use client";
import { useEffect, useState } from "react";
import { Button, Field } from "@delta/ui";
import { api, fields } from "./api";
export default function ResetPassword({
  run,
}: {
  run: (fn: () => Promise<void>) => Promise<void>;
}) {
  const [token, setToken] = useState(""),
    [done, setDone] = useState(false);
  useEffect(() => {
    setToken(new URLSearchParams(location.search).get("token") || "");
  }, []);
  return (
    <div className="invitation-accept">
      <div className="eyebrow muted">YOUR DELTA ACCOUNT</div>
      <h2>
        {done
          ? "Check your next step"
          : token
            ? "Choose a new password"
            : "Recover your account"}
      </h2>
      {done ? (
        <>
          <p>
            {token
              ? "Your password was updated and existing sessions were signed out."
              : "If an eligible account exists, a one-time reset link has been sent to its email."}
          </p>
          <a className="button" href="/">
            Return to sign in
          </a>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = fields(e.currentTarget);
            run(async () => {
              await api(
                token ? "account/reset-password" : "account/request-reset",
                "POST",
                token ? { token, password: f.password } : { email: f.email },
              );
              if (token) history.replaceState({}, "", location.pathname);
              setDone(true);
            });
          }}
        >
          {token ? (
            <Field
              label="New password (at least 10 characters)"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              required
            />
          ) : (
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          )}
          <Button>{token ? "Update password" : "Request reset link"}</Button>
        </form>
      )}
    </div>
  );
}
