import PostCard from "@/components/post/PostCard";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { auth } from "@/auth";

async function getPosts(skip: number, pageSize: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  return prisma.posts.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      community: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      _count: { select: { comments: true } },
      votes: { select: { value: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = 10;
  const skip = (pageNum - 1) * pageSize;

  const [posts, session] = await Promise.all([
    getPosts(skip, pageSize),
    auth(),
  ]);

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  return (
    <div>
      <div className="mb-5 border-b border-zinc-800 pb-4">
        <h1 className="text-base font-semibold text-white">Latest Posts</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Discussions from across all communities
        </p>
      </div>

      <div>
        {posts.length > 0 ? (
          posts.map((post) => {
            const score = post.votes.reduce((acc, v) => acc + v.value, 0);
            const userVote = currentUserId ? (post.votes.find((v) => v.userId === currentUserId)?.value ?? 0) : 0;

            return (
              <PostCard
                id={post.id}
                key={post.id}
                title={post.title}
                content={post.content}
                community={post.community.name}
                communitySlug={post.community.slug}
                author={post.author.name}
                commentCount={post._count.comments}
                score={score}
                userVote={userVote}
              />
            );
          })
        ) : (
          <div className="rounded-md border border-zinc-800 p-12 text-center">
            <p className="text-sm text-zinc-500">
              No posts yet. Be the first to share something!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
