type CommentCardProps = {
  author: string;
  content: string;
};

export default function CommentCard({ author, content }: CommentCardProps) {
  return (
    <div className="flex gap-3 border-b border-zinc-800 py-3 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
        {author.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="mb-1 text-sm font-medium text-white">{author}</p>
        <p className="text-sm leading-relaxed text-zinc-400">{content}</p>
      </div>
    </div>
  );
}
