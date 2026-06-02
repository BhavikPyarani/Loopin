"use client";

import { useActionState } from "react";
import { createCommunity } from "@/actions/community";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function CreateCommunityForm() {
  const initialState = {
    errors: {} as Record<string, string[]>,
  };
  const [state, formAction, pending] = useActionState(
    createCommunity,
    initialState
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Create Community</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Build a space for people who share your interests
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Community Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Next.js Developers"
              className={inputClass}
            />
            {state.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Slug
            </label>
            <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900 focus-within:border-indigo-500">
              <span className="select-none pl-3 text-sm text-zinc-600">
                /c/
              </span>
              <input
                type="text"
                name="slug"
                placeholder="nextjs-developers"
                className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </div>
            {state.errors?.slug && (
              <p className="text-xs text-red-400">{state.errors.slug[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="What is this community about?"
              className={`${inputClass} resize-none`}
            />
            {state.errors?.description && (
              <p className="text-xs text-red-400">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
}
