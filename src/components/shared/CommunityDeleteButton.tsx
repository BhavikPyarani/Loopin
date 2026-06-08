"use client";

import { useTransition, useState } from "react";
import { deleteCommunity } from "@/actions/community";

type CommunityDeleteButtonProps = {
  slug: string;
};

export default function CommunityDeleteButton({ slug }: CommunityDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCommunity(slug);
      } catch (error) {
        // Rethrow Next.js redirect errors so that redirection is handled properly
        if (error instanceof Error && (error.message.includes("NEXT_REDIRECT") || (error as any).digest?.startsWith("NEXT_REDIRECT"))) {
          throw error;
        }
        alert(error instanceof Error ? error.message : "Failed to delete community.");
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="rounded-md border border-red-800/40 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-950/20 hover:text-red-300 disabled:opacity-50 cursor-pointer"
      >
        Delete Community
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-white">Delete Community</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Are you sure you want to delete this community? All posts and comments within it will be permanently deleted. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-md bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
