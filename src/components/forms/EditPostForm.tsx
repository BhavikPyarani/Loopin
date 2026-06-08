"use client";

import { useActionState } from "react";
import { updatePost } from "@/actions/post";
import RichTextEditor from "@/components/editor/RichTextEditor";
import Link from "next/link";

type EditPostFormProps = {
  post: {
    id: number;
    title: string;
    content: string;
  };
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function EditPostForm({ post }: EditPostFormProps) {
  const initialState = {
    errors: {} as Record<string, string[]>,
  };
  const [state, formAction, pending] = useActionState(updatePost, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Edit Post</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Make changes to your discussion
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="space-y-4">
          {/* Hidden field for post ID */}
          <input type="hidden" name="id" value={post.id} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Title
            </label>
            <input
              name="title"
              type="text"
              defaultValue={post.title}
              placeholder="Give your post a title..."
              className={inputClass}
            />
            {state?.errors?.title && (
              <p className="text-xs text-red-400">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Content
            </label>
            <RichTextEditor
              name="content"
              defaultValue={post.content}
              placeholder="Write your post..."
              disabled={pending}
            />
            {state?.errors?.content && (
              <p className="text-xs text-red-400">{state.errors.content[0]}</p>
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
              href={`/post/${post.id}`}
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
