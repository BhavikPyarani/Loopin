import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Loader from "@/components/shared/Loader";
import { prisma } from "@/lib/prisma";
import MobileMenu from "@/components/layout/MobileMenu";

async function NavbarAuth() {
  const [session, communities] = await Promise.all([
    auth(),
    prisma.community.findMany({
      select: { name: true, slug: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    }).catch((err) => {
      console.error("Failed to load communities for navbar:", err);
      return [];
    }),
  ]);

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/register"
            className="px-3 py-1.5 text-sm text-zinc-400 transition hover:text-white"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu for Guest */}
        <MobileMenu
          communities={communities}
          sessionUser={null}
          signOutAction={handleSignOut}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-3">
        <Link
          href="/chat"
          className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Chat
        </Link>

        <Link
          href="/create-post"
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <span className="text-base leading-none">+</span>
          Post
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
            {session.user.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <span className="text-sm text-zinc-300">
            {session.user.name}
          </span>
        </div>

        <form action={handleSignOut}>
          <button
            type="submit"
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Mobile Menu for Authenticated User */}
      <MobileMenu
        communities={communities}
        sessionUser={session.user}
        signOutAction={handleSignOut}
      />
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/LoopinLogo.png" alt="Loopin Logo" width={200} height={200} />
        </Link>

        {/* Search */}
        <div className="hidden max-w-sm flex-1 md:block">
          <input
            type="text"
            placeholder="Search discussions..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
          />
        </div>

        {/* Actions — auth section streams in behind Suspense */}
        <div className="flex shrink-0 items-center gap-2">
          <Suspense fallback={<Loader size={32} />}>
            <NavbarAuth />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
