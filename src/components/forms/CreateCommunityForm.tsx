"use client";

import { useActionState, useState } from "react";
import { createCommunity } from "@/actions/community";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars except spaces/hyphens
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // merge multiple hyphens
};

export default function CreateCommunityForm() {
  const initialState = {
    errors: {} as Record<string, string[]>,
  };
  const [state, formAction, pending] = useActionState(
    createCommunity,
    initialState
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

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
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Next.js Developers"
              className={inputClass}
              required
            />
            {state.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Slug
            </label>
            <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900 focus-within:border-indigo-500 w-full">
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="nextjs-developers"
                className={inputClass}
                required
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
              required
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
