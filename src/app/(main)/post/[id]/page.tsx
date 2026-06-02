import { prisma } from "@/lib/prisma";
import CommentForm from "@/components/comments/comment-form";
import CommentCard from "@/components/comments/comment-card";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

type PostPageProps = {
  params: Promise<{ id: string }>;
};

export default function PostPage(props: PostPageProps) {
  return (
    <div className="max-w-3xl space-y-6">
      <Suspense fallback={<PostSkeleton />}>
        <PostContent params={props.params} />
      </Suspense>
    </div>
  );
}

async function PostContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);

  // Load post first (typically faster)
  const post = await getPost(postId);

  if (!post) {
    return (
      <div className="rounded-md border border-red-800 bg-red-900/20 p-8 text-center">
        <h1 className="text-base font-semibold text-red-400">Post not found</h1>
        <p className="mt-1 text-sm text-zinc-500">
          This post may have been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <article className="rounded-md border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <span className="font-medium text-indigo-400">{post.community.name}</span>
          <span>·</span>
          <span>
            posted by <span className="text-zinc-400">{post.author.name}</span>
          </span>
        </div>

        <h1 className="mb-5 text-2xl font-bold text-white leading-snug">
          {post.title}
        </h1>

        <div
          className="rich-content text-sm text-zinc-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection postId={post.id} />
      </Suspense>
    </>
  );
}

function PostSkeleton() {
  return (
    <>
      <div className="rounded-md border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 flex gap-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-3.5 w-32 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="mb-5 h-7 w-3/4 animate-pulse rounded bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
      <div className="rounded-md border border-zinc-800 bg-zinc-900 p-6">
        <div className="h-5 w-20 animate-pulse rounded bg-zinc-800" />
      </div>
    </>
  );
}

function CommentsSkeleton() {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 h-5 w-20 animate-pulse rounded bg-zinc-800" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-md border border-zinc-700 bg-zinc-800 p-3">
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-zinc-700" />
            <div className="space-y-1">
              <div className="h-3 w-full animate-pulse rounded bg-zinc-700" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function CommentsSection({ postId }: { postId: number }) {
  const comments = await getPostComments(postId);

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-sm font-semibold text-white">
        {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
      </h2>

      <CommentForm postId={postId} />

      {comments.length > 0 ? (
        <div className="mt-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              author={comment.author.name}
              content={comment.content}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-500">
            No replies yet. Start the conversation!
          </p>
        </div>
      )}
    </section>
  );
}

async function getPost(id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(`post-${id}`, "posts");
  return prisma.posts.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      community: { select: { name: true } },
      author: { select: { name: true } },
    },
  });
}

async function getPostComments(postId: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`post-${postId}-comments`);
  return prisma.comment.findMany({
    where: { postId },
    select: {
      id: true,
      content: true,
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
