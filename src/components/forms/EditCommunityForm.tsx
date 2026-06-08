"use client";

import { useActionState } from "react";
import { updateCommunity } from "@/actions/community";
import Link from "next/link";

type EditCommunityFormProps = {
  community: {
    slug: string;
    name: string;
    description: string;
  };
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function EditCommunityForm({ community }: EditCommunityFormProps) {
  const initialState = {
    errors: {} as Record<string, string[]>,
  };
  const [state, formAction, pending] = useActionState(
    updateCommunity,
    initialState
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Edit Community</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Update the settings for /c/{community.slug}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="space-y-4">
          {/* Hidden field for slug */}
          <input type="hidden" name="slug" value={community.slug} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Community Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={community.name}
              placeholder="e.g. Next.js Developers"
              className={inputClass}
            />
            {state.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={community.description}
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

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/communities/${community.slug}`}
              className="rounded-md border border-zinc-800 px-5 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
