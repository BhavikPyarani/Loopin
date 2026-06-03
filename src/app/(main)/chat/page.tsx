import ChatRoom from "@/components/chat/chat-room";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <div>
      <div className="mb-5 border-b border-zinc-800 pb-4">
        <h1 className="text-base font-semibold text-white">Chat Room</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Connect with other users in realtime.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-[70vh] animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
        }
      >
        <ChatContent />
      </Suspense>
    </div>
  );
}

async function ChatContent() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <ChatRoom
      userName={session.user.name ?? "Anonymous"}
      userId={session.user.id ?? ""}
    />
  );
}
