import Link from "next/link";
import VoteWidget from "@/components/post/VoteWidget";
import ShareButton from "@/components/post/ShareButton";

type PostCardProps = {
  id: number;
  title: string;
  content: string;
  community: string;
  communitySlug: string;
  author: string;
  commentCount?: number;
  score: number;
  userVote: number;
  createdAt: Date;
};

export default function PostCard({
  id,
  title,
  content,
  community,
  communitySlug,
  author,
  commentCount = 0,
  score,
  userVote,
  createdAt,
}: PostCardProps) {
  return (
    <article className="border-b border-zinc-800 px-1 py-4 last:border-0 hover:bg-zinc-900/40 transition-colors">
      {/* Meta row */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
        <Link
          href={`/communities/${communitySlug}`}
          className="font-medium text-indigo-400 hover:underline"
        >
          {community}
        </Link>
        <span>·</span>
        <span>
          posted by{" "}
          <span className="text-zinc-400">{author}</span>
        </span>
        <span>·</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>

      {/* Title */}
      <Link href={`/post/${id}`}>
        <h2 className="mb-1.5 text-base font-semibold text-white leading-snug hover:text-zinc-200">
          {title}
        </h2>
      </Link>

      {/* Content preview — strip HTML tags for plain-text excerpt */}
      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
        {content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
      </p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
        <VoteWidget postId={id} initialScore={score} initialUserVote={userVote} />

        <Link
          href={`/post/${id}`}
          className="flex items-center gap-1 rounded px-2 py-1 transition hover:bg-zinc-800 hover:text-zinc-400"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{commentCount} {commentCount === 1 ? "reply" : "replies"}</span>
        </Link>

        <ShareButton postId={id} title={title} />
      </div>
    </article>
  );
}
