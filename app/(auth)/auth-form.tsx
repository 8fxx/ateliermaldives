"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register, type AuthState } from "./actions";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : register, undefined);
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <p className="eyebrow text-mute">{mode === "login" ? "Welcome back" : "Create an account"}</p>
      <h1 className="mt-3 font-serif text-6xl">{mode === "login" ? "Sign in" : "Join"}</h1>

      <form action={action} className="mt-10 space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
        {mode === "register" && (
          <>
            <input name="name" required placeholder="Full name" autoComplete="name" className="field" />
            <input name="phone" placeholder="Phone (for delivery)" autoComplete="tel" className="field" />
          </>
        )}
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className="field" />
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          placeholder="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="field"
        />
        {state?.error && <p className="text-sm text-coral">{state.error}</p>}
        <button className="btn-dark w-full" disabled={pending}>
          {pending ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-mute">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href={`/register${nextQuery}`} className="text-ink underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${nextQuery}`} className="text-ink underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </section>
  );
}
