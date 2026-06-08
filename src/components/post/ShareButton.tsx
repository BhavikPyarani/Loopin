"use client";

import { useState } from "react";

type ShareButtonProps = {
  postId: number;
  title?: string;
};

export default function ShareButton({ postId, title }: ShareButtonProps) {

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Check out this post on Loopin",
          url: url,
        });
        return;
      } catch (err) {
        console.log("Web Share failed, copying to clipboard instead:", err);
      }
    }

  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded px-2 py-1 transition hover:bg-zinc-800 hover:text-zinc-300 text-zinc-500 cursor-pointer"
      title="Share this post"
    >
        <>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </>
    </button>
  );
}
