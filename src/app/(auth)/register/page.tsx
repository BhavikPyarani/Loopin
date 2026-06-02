"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth";

const initialState = {
  errors: {},
} as {
  errors: { name?: string[]; email?: string[]; password?: string[] };
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState
  );

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-indigo-600" />
        <span className="text-xl font-semibold text-white">Loopin</span>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-7">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">Create account</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Join the community — it&apos;s free
          </p>
        </div>

        {state?.error && (
          <div className="mb-5 rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Your full name"
              className={inputClass}
            />
            {state?.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
            />
            {state?.errors?.email && (
              <p className="text-xs text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
            />
            {state?.errors?.password && (
              <p className="text-xs text-red-400">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
