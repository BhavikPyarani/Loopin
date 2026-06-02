"use client";

import { useActionState } from "react";
import { createPost } from "@/actions/post";
import RichTextEditor from "@/components/editor/rich-text-editor";

type CommunityOption = {
  id: number;
  name: string;
};

type CreatePostFormProps = {
  communities: CommunityOption[];
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function CreatePostForm({ communities }: CreatePostFormProps) {
  const initialState = {
    errors: {} as Record<string, string[]>,
  };
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Create Post</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Share something with the community
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Title
            </label>
            <input
              name="title"
              type="text"
              placeholder="Give your post a title..."
              className={inputClass}
            />
            {state?.errors?.title && (
              <p className="text-xs text-red-400">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Community
            </label>
            <select
              name="communityId"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">Select a community...</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            {state?.errors?.communityId && (
              <p className="text-xs text-red-400">
                {state.errors.communityId[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Content
            </label>
            <RichTextEditor
              name="content"
              placeholder="Write your post — use headings, lists, or code blocks to structure your thoughts..."
              disabled={pending}
            />
            {state?.errors?.content && (
              <p className="text-xs text-red-400">{state.errors.content[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
