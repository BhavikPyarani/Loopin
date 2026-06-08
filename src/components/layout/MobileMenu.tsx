"use client";

import { useState } from "react";
import Link from "next/link";

type CommunityOption = {
  name: string;
  slug: string;
};

type MobileMenuProps = {
  communities: CommunityOption[];
  sessionUser: { name?: string | null; email?: string | null } | null;
  signOutAction: () => Promise<void>;
};

export default function MobileMenu({
  communities,
  sessionUser,
  signOutAction,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Toggle Menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
      >
        {isOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Sliding Panel */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <span className="text-base font-bold text-white">Menu</span>
              <button
                onClick={closeMenu}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Search */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Search discussions..."
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
              />
            </div>

            {/* Main Links */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                Home
              </Link>
              {sessionUser && (
                <>
                  <Link
                    href="/chat"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Chat
                  </Link>
                  <Link
                    href="/create-post"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Create Post
                  </Link>
                  <Link
                    href="/create-community"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Create Community
                  </Link>
                </>
              )}
            </div>

            {/* Communities list section */}
            <div className="mt-5 border-t border-zinc-800 pt-4 flex-1 overflow-y-auto">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Communities
              </p>
              <div className="space-y-0.5 max-h-[40vh] overflow-y-auto">
                {communities.length > 0 ? (
                  communities.map((community) => (
                    <Link
                      key={community.slug}
                      href={`/communities/${community.slug}`}
                      onClick={closeMenu}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-900 text-[10px] font-semibold text-zinc-400 border border-zinc-800">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{community.name}</span>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-xs text-zinc-600">
                    No communities available
                  </p>
                )}
              </div>
            </div>

            {/* Footer Auth Section */}
            <div className="border-t border-zinc-800 pt-4 mt-auto">
              {sessionUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 px-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
                      {sessionUser.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">
                        {sessionUser.name}
                      </p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      await signOutAction();
                      closeMenu();
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
