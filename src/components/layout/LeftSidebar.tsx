import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export default async function LeftSidebar() {
  "use cache";
  cacheLife("hours");
  cacheTag("communities");

  let communities: { name: string; slug: string }[] = [];

  try {
    communities = await prisma.community.findMany({
      select: { name: true, slug: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    // Avoid failing prerender/build if DB is temporarily unavailable.
    console.error("Failed to load communities for sidebar:", error);
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-zinc-800 lg:block">
      <div className="sticky top-14 p-3">
        <p className="mb-1 px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Communities
        </p>

        <div className="space-y-0.5">
          {communities.length > 0 ? (
            communities.map((community) => (
              <Link
                key={community.slug}
                href={`/communities/${community.slug}`}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs font-semibold text-zinc-300">
                  {community.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{community.name}</span>
              </Link>
            ))
          ) : (
            <p className="px-2 py-2 text-sm text-zinc-500">
              Communities are unavailable right now.
            </p>
          )}
        </div>

        <div className="mt-3 border-t border-zinc-800 pt-3">
          <Link
            href="/create-community"
            className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-dashed border-zinc-700 text-sm leading-none text-zinc-600">
              +
            </span>
            New Community
          </Link>
        </div>
      </div>
    </aside>
  );
}
