"use client";

import { useState, useTransition, useEffect } from "react";

type CreateCommunityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (community: { id: number; name: string; slug: string }) => void;
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function CreateCommunityModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCommunityModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  // Auto-generate slug from name
  useEffect(() => {
    const generated = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars except spaces/hyphens
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/-+/g, "-"); // merge multiple hyphens
    setSlug(generated);
  }, [name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      try {
        const res = await fetch("/api/communities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, slug, description }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.errors) {
            setErrors(data.errors);
          } else if (data.error) {
            setErrors({ general: [data.error] });
          } else {
            setErrors({ general: ["Failed to create community."] });
          }
          return;
        }

        // Successfully created!
        setName("");
        setSlug("");
        setDescription("");
        onSuccess(data);
        onClose();
      } catch (error) {
        console.error("Modal creation submit error:", error);
        setErrors({ general: ["An unexpected error occurred."] });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Create Community</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Build a space for people who share your interests
          </p>
        </div>

        {errors.general && (
          <p className="mb-4 text-xs text-red-400 font-medium">
            {errors.general[0]}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Community Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next.js Developers"
              className={inputClass}
              required
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="nextjs-developers"
              className={inputClass}
              required
            />
            {errors.slug && (
              <p className="text-xs text-red-400">{errors.slug[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this community about?"
              className={`${inputClass} resize-none`}
              required
            />
            {errors.description && (
              <p className="text-xs text-red-400">{errors.description[0]}</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
