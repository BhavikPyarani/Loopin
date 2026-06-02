"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import Link from "next/link";
import { loginSchema } from "@/lib/validations/auth";
import { auth as firebaseAuth } from "@/lib/firebase";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function LoginPage() {
  const [errors, setErrors] = useState<{ email?: string[]; password?: string[] }>({});
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const parseResult = loginSchema.safeParse({ email, password });

    if (!parseResult.success) {
      setErrors(parseResult.error.flatten().fieldErrors);
      setPending(false);
      return;
    }

    const response = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/",
      email,
      password,
    });

    if (!response || response.error) {
      setError("Invalid email or password.");
      setPending(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (firebaseError: unknown) {
      const firebaseErrorDetails =
        typeof firebaseError === "object" && firebaseError !== null
          ? (firebaseError as Record<string, unknown>)
          : null;
      const firebaseErrorCode =
        typeof firebaseErrorDetails?.code === "string"
          ? firebaseErrorDetails.code
          : undefined;
      const firebaseErrorMessage =
        typeof firebaseErrorDetails?.message === "string"
          ? firebaseErrorDetails.message
          : "";

      if (
        firebaseErrorCode === "auth/user-not-found" ||
        firebaseErrorCode === "user-not-found"
      ) {
        try {
          await createUserWithEmailAndPassword(firebaseAuth, email, password);
        } catch (createError) {
          console.error(createError);
          setError(
            "Firebase authentication failed. Please try signing in again."
          );
          setPending(false);
          return;
        }
      } else if (
        firebaseErrorCode === "auth/configuration-not-found" ||
        firebaseErrorMessage.includes("CONFIGURATION_NOT_FOUND")
      ) {
        // Firebase is optional for auth login; allow app sign-in via credentials.
        console.warn("Firebase is not configured. Continuing without Firebase auth.");
      } else {
        console.error(firebaseError);
        setError("Firebase authentication failed. Please try again.");
        setPending(false);
        return;
      }
    }

    router.push("/");
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-indigo-600" />
        <span className="text-xl font-semibold text-white">Loopin</span>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-7">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">Welcome back</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
            {errors?.email && (
              <p className="text-xs text-red-400">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className={inputClass}
            />
            {errors?.password && (
              <p className="text-xs text-red-400">{errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
