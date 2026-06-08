"use client";

import { useActionState, useState } from "react";
import { createPost } from "@/actions/post";
import RichTextEditor from "@/components/editor/RichTextEditor";
import CreateCommunityModal from "@/components/forms/CreateCommunityModal";

type CommunityOption = {
  id: number;
  name: string;
};

type CreatePostFormProps = {
  communities: CommunityOption[];
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500";

export default function CreatePostForm({ communities }: CreatePostFormProps) {
  const initialState = {
    errors: {} as Record<string, string[]>,
  };
  const [state, formAction, pending] = useActionState(createPost, initialState);

  // Community selection states
  const [communityList, setCommunityList] = useState<CommunityOption[]>(communities);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateSuccess = (newCommunity: { id: number; name: string }) => {
    setCommunityList((prev) => [...prev, newCommunity]);
    setSelectedIds((prev) => [...prev, newCommunity.id]);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Create Post</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Share something with the community
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="space-y-4">
          {/* Hidden inputs to feed selected community IDs into the form submit */}
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="communityIds" value={id} />
          ))}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Title
            </label>
            <input
              name="title"
              type="text"
              placeholder="Give your post a title..."
              className={inputClass}
            />
            {state?.errors?.title && (
              <p className="text-xs text-red-400">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1.5 relative">
            <label className="block text-sm font-medium text-zinc-300">
              Communities
            </label>

            {/* Custom Dropdown Trigger */}
            <div className="relative z-20">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex min-h-[42px] w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-sm text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                {selectedIds.length === 0 ? (
                  <span className="text-zinc-600">Select communities...</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedIds.map((id) => {
                      const comm = communityList.find((c) => c.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded bg-indigo-950/50 border border-indigo-800/40 px-2 py-0.5 text-xs text-indigo-300"
                        >
                          {comm?.name}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(id);
                            }}
                            className="font-bold text-indigo-400 hover:text-indigo-200 cursor-pointer pl-1"
                          >
                            ×
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
                <span className="text-zinc-500 text-xs pl-2">▼</span>
              </button>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-1 shadow-lg">
                  <div className="space-y-0.5">
                    {communityList.map((community) => {
                      const isChecked = selectedIds.includes(community.id);
                      return (
                        <div
                          key={community.id}
                          onClick={() => toggleSelect(community.id)}
                          className="flex items-center gap-2 rounded px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by div click
                            className="h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-zinc-900"
                          />
                          <span className="truncate">{community.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-zinc-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-indigo-400 transition hover:bg-zinc-900 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    + Create your own community
                  </button>
                </div>
              )}
            </div>

            {/* Click Outside Overlay */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}

            {state?.errors?.communityIds && (
              <p className="text-xs text-red-400">
                {state.errors.communityIds[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Content
            </label>
            <RichTextEditor
              name="content"
              placeholder="Write your post — use headings, lists, or code blocks to structure your thoughts..."
              disabled={pending}
            />
            {state?.errors?.content && (
              <p className="text-xs text-red-400">{state.errors.content[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>

      {/* Inline Create Community Modal */}
      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
