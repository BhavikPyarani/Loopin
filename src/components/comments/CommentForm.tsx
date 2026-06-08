"use client";

import { useRef, useState, useTransition } from "react";
import { createComment } from "@/actions/comment";

type CommentFormProps = {
  postId: number;
};

export default function CommentForm({ postId }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createComment(postId, formData);
        formRef.current?.reset();
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "To comment on this post, you must be logged in."
        );
      }
    });
  };

  return (
    <form ref={formRef} action={handleAction} className="space-y-2">
      <textarea
        name="content"
        rows={3}
        placeholder="Share your thoughts..."
        className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500 disabled:opacity-50"
        disabled={isPending}
      />

      {errorMessage ? (
        <p className="rounded-md border border-red-700 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
}
