import PostCard from "@/components/post/post-card";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

type CommunityPageProps = {
  params: Promise<{ slug: string }>;
};

export default function CommunityPage(props: CommunityPageProps) {
  return (
    <Suspense fallback={<CommunityPageSkeleton />}>
      <CommunityContent params={props.params} />
    </Suspense>
  );
}

async function CommunityContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [community, communityPosts] = await Promise.all([
    getCommunity(slug),
    getCommunityPosts(slug),
  ]);

  if (!community) {
    return (
      <div className="rounded-md border border-red-800 bg-red-900/20 p-8 text-center">
        <h1 className="text-base font-semibold text-red-400">
          Community not found
        </h1>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-base font-bold text-white">
            {community.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-sm text-zinc-500">{community.description}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        {communityPosts.length > 0 ? (
          communityPosts.map((post) => (
            <PostCard
              id={post.id}
              key={post.id}
              title={post.title}
              content={post.content}
              community={post.community.name}
              communitySlug={post.community.slug}
              author={post.author.name}
              commentCount={post._count.comments}
            />
          ))
        ) : (
          <div className="rounded-md border border-zinc-800 p-12 text-center">
            <p className="text-sm text-zinc-500">
              No posts yet. Be the first to share!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommunityPageSkeleton() {
  return (
    <div>
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-zinc-800 px-1 py-4">
            <div className="mb-2 h-3 w-40 animate-pulse rounded bg-zinc-800" />
            <div className="mb-1.5 h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function getCommunity(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`community-${slug}`, "communities");
  return prisma.community.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
}

async function getCommunityPosts(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`community-${slug}-posts`, "posts");
  return prisma.posts.findMany({
    where: { community: { slug } },
    select: {
      id: true,
      title: true,
      content: true,
      community: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
