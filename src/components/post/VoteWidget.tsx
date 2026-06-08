"use client";

import { useState, useTransition, useEffect } from "react";
import { votePost } from "@/actions/post";

type VoteWidgetProps = {
  postId: number;
  initialScore: number;
  initialUserVote: number;
};

export default function VoteWidget({
  postId,
  initialScore,
  initialUserVote,
}: VoteWidgetProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isPending, startTransition] = useTransition();

  // Sync state if props change from parent
  useEffect(() => {
    setScore(initialScore);
    setUserVote(initialUserVote);
  }, [initialScore, initialUserVote]);

  const handleVote = (targetVote: number) => {
    if (isPending) return;

    // Calculate optimistic updates
    let voteDiff = 0;
    let nextVote = 0;

    if (targetVote === 1) {
      if (userVote === 1) {
        nextVote = 0;
        voteDiff = -1;
      } else if (userVote === -1) {
        nextVote = 1;
        voteDiff = 2;
      } else {
        nextVote = 1;
        voteDiff = 1;
      }
    } else if (targetVote === -1) {
      if (userVote === -1) {
        nextVote = 0;
        voteDiff = 1;
      } else if (userVote === 1) {
        nextVote = -1;
        voteDiff = -2;
      } else {
        nextVote = -1;
        voteDiff = -1;
      }
    }

    const previousScore = score;
    const previousVote = userVote;

    // Apply optimistic updates
    setScore(score + voteDiff);
    setUserVote(nextVote);

    startTransition(async () => {
      try {
        await votePost(postId, nextVote);
      } catch (error) {
        // Revert on error
        setScore(previousScore);
        setUserVote(previousVote);
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
          // Ignore redirect triggers if any
          return;
        }
        alert(error instanceof Error ? error.message : "Failed to register vote.");
      }
    });
  };

  return (
    <div className="flex items-center gap-0.5 rounded bg-zinc-800/40 p-0.5 border border-zinc-800/50">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        title="Upvote"
        className={`flex h-6 w-6 items-center justify-center rounded transition cursor-pointer hover:bg-zinc-800 ${
          userVote === 1 ? "text-orange-500" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill={userVote === 1 ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Score */}
      <span
        className={`px-1 text-xs font-semibold select-none min-w-[16px] text-center ${
          userVote === 1
            ? "text-orange-500"
            : userVote === -1
            ? "text-indigo-400"
            : "text-zinc-400"
        }`}
      >
        {score}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        title="Downvote"
        className={`flex h-6 w-6 items-center justify-center rounded transition cursor-pointer hover:bg-zinc-800 ${
          userVote === -1 ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill={userVote === -1 ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
