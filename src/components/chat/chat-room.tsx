"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { limitToLast, onChildAdded, orderByChild, query, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { realtimeDb, auth as firebaseAuth } from "@/lib/firebase";
import { sendChatMessage } from "@/actions/chat";

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  createdAt: number;
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(timestamp));
};

const MAX_MESSAGES = 100;

export default function ChatRoom({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Limit initial load to the 50 most recent messages
  const messagesQuery = useMemo(
    () =>
      query(
        ref(realtimeDb, "chat/messages"),
        orderByChild("createdAt"),
        limitToLast(50)
      ),
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setFirebaseUid(user.uid);
      } else {
        setFirebaseUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onChildAdded(messagesQuery, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;

      setMessages((current) => {
        const next = [
          ...current,
          {
            id: snapshot.key ?? `${Date.now()}-${Math.random()}`,
            user: value.user,
            text: value.text,
            createdAt: value.createdAt ?? Date.now(),
          },
        ];
        // Cap the rendered list so the DOM doesn't grow unboundedly
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
    });

    return () => unsubscribe();
  }, [messagesQuery]);

  // Scroll to bottom on new messages — direct scrollTop is faster than scrollIntoView
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!firebaseUid) {
      setError("Not authenticated. Please log in.");
      return;
    }

    try {
      await sendChatMessage(text, userName, firebaseUid);
      setInput("");
      setError(null);
    } catch (sendError) {
      console.error("Chat send error:", sendError);
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send message. Check Firebase console and auth state."
      );
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Live Chat</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Messages are synced instantly through Firebase Realtime Database.
          </p>
        </div>
        <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
          {userName}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="mb-4 max-h-[60vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4 text-sm"
      >
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500">
            No messages yet. Say hello to start the conversation.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="mb-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-zinc-400">
                <span className="font-medium text-zinc-100">{message.user}</span>
                <span>{formatTime(message.createdAt)}</span>
              </div>
              <p className="text-sm leading-6 text-zinc-200">{message.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="min-h-11.5 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleSend}
          className="shrink-0 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Send
        </button>
      </div>
      {error ? (
        <div className="mt-3 rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}
    </div>
  );
}

