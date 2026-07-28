"use client";

import { useActionState, useState } from "react";
import { login, signup } from "./actions";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, undefined);
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    undefined
  );

  const state = mode === "login" ? loginState : signupState;
  const action = mode === "login" ? loginAction : signupAction;
  const pending = mode === "login" ? loginPending : signupPending;

  return (
    <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md px-3 py-2 font-medium ${
            mode === "login"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md px-3 py-2 font-medium ${
            mode === "signup"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Sign up
        </button>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green-600">{state.success}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
