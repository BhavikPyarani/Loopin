type CommentCardProps = {
  author: string;
  content: string;
  createdAt: Date;
};

export default function CommentCard({ author, content, createdAt }: CommentCardProps) {
  return (
    <div className="flex gap-3 border-b border-zinc-800 py-3 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
        {author.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-sm font-medium text-white">{author}</span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-500">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">{content}</p>
      </div>
    </div>
  );
}
