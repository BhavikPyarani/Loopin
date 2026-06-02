import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreatePostForm from "@/components/forms/create-post-form";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

export default function CreatePostPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-md border border-zinc-800 bg-zinc-900" />
      }
    >
      <CreatePostContent />
    </Suspense>
  );
}

async function CreatePostContent() {
  const session = await auth();
  if (!session) redirect("/login");
  const communities = await getCommunitiesForSelect();
  return <CreatePostForm communities={communities} />;
}

async function getCommunitiesForSelect() {
  "use cache";
  cacheLife("hours");
  cacheTag("communities");
  return prisma.community.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
