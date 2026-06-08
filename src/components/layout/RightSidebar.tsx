import { prisma } from "@/lib/prisma";

export default async function RightSidebar() {
  const [communityCount, postCount] = await Promise.all([
    prisma.community.count(),
    prisma.posts.count(),
  ]);

  const trending = [
    { tag: "#nextjs", posts: "2.4k" },
    { tag: "#react", posts: "1.8k" },
    { tag: "#typescript", posts: "1.2k" },
    { tag: "#webdev", posts: "982" },
    { tag: "#openai", posts: "741" },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-l border-zinc-800 xl:block">
      <div className="sticky top-14 p-4 space-y-4">
        {/* Trending */}
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Trending
          </p>
          <div className="space-y-2">
            {trending.map(({ tag }) => (
              <div
                key={tag}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="text-sm text-zinc-300 group-hover:text-indigo-400 transition-colors">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-sm font-semibold text-white">About Loopin</p>
          <p className="text-sm leading-relaxed text-zinc-500">
            A community platform for developers to discuss, share, and connect.
          </p>
          <div className="mt-3 flex gap-6 border-t border-zinc-800 pt-3">
            <div>
              <p className="text-sm font-semibold text-white">{communityCount}</p>
              <p className="text-xs text-zinc-500">Communities</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{postCount}</p>
              <p className="text-xs text-zinc-500">Posts</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Quick Links
          </p>
          <div className="space-y-0.5">
            {[
              { label: "Create a Post", href: "/create-post" },
              { label: "New Community", href: "/create-community" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
