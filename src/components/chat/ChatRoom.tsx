"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  limitToLast,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { realtimeDb, auth as firebaseAuth } from "@/lib/firebase";
import { getUsers } from "@/actions/user";

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  createdAt: number;
  editedAt?: number;
  userId?: string;
};

type ChatRoomMetadata = {
  id: string;
  name: string;
  type: "global" | "direct" | "group";
  participants?: Record<string, boolean>;
  participantNames?: Record<string, string>;
  createdAt: number;
  createdBy?: string;
};

type UserDetail = {
  id: string;
  name: string;
  email: string;
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(timestamp));
};

const MAX_MESSAGES = 100;

export default function ChatRoom({
  userName,
  userId,
}: {
  userName: string;
  userId: string;
}) {
  // Chat Room and Messages State
  const [rooms, setRooms] = useState<ChatRoomMetadata[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>("global");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  // Editing Message State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Modals & Users State
  const [availableUsers, setAvailableUsers] = useState<UserDetail[]>([]);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Group creation form states
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<string[]>([]);

  // Mobile layout state
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  // Fetch Users list on mount
  useEffect(() => {
    getUsers()
      .then((data) => setAvailableUsers(data))
      .catch((err) => console.error("Error loading users:", err));
  }, []);

  // Sync rooms list from Firebase
  useEffect(() => {
    if (!realtimeDb) return;

    const roomsRef = ref(realtimeDb, "chat/rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      
      const roomsList: ChatRoomMetadata[] = [
        {
          id: "global",
          name: "Global Chat Room",
          type: "global",
          createdAt: 0,
        },
      ];

      if (data) {
        Object.entries(data).forEach(([id, val]: [string, any]) => {
          if (id === "global") return;

          // Check if current user is a participant using the Prisma userId
          const isParticipant = val.participants && val.participants[userId];

          if (isParticipant) {
            roomsList.push({
              id,
              name: val.name,
              type: val.type,
              participants: val.participants,
              participantNames: val.participantNames,
              createdAt: val.createdAt ?? Date.now(),
              createdBy: val.createdBy,
            });
          }
        });
      }
      setRooms(roomsList);
    });

    return () => unsubscribe();
  }, [userId]);

  // Messages Query based on activeRoomId
  const messagesQuery = useMemo(
    () =>
      realtimeDb
        ? query(
            ref(realtimeDb, `chat/messages/${activeRoomId}`),
            orderByChild("createdAt"),
            limitToLast(50)
          )
        : null,
    [activeRoomId]
  );

  // Sync Firebase Auth State
  useEffect(() => {
    const authInstance = firebaseAuth;
    if (!authInstance) {
      setFirebaseUid(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setFirebaseUid(user.uid);
      } else {
        setFirebaseUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync messages for the active room
  useEffect(() => {
    setMessages([]); // Clear messages immediately when switching rooms
    if (!messagesQuery) return;

    const unsubAdded = onChildAdded(messagesQuery, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;

      setMessages((current) => {
        if (current.some((msg) => msg.id === snapshot.key)) {
          return current;
        }
        const next = [
          ...current,
          {
            id: snapshot.key ?? `${Date.now()}-${Math.random()}`,
            user: value.user,
            text: value.text,
            createdAt: value.createdAt ?? Date.now(),
            editedAt: value.editedAt,
            userId: value.userId,
          },
        ];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
    });

    const unsubChanged = onChildChanged(messagesQuery, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;

      setMessages((current) =>
        current.map((msg) =>
          msg.id === snapshot.key
            ? {
                ...msg,
                text: value.text,
                editedAt: value.editedAt,
              }
            : msg
        )
      );
    });

    const unsubRemoved = onChildRemoved(messagesQuery, (snapshot) => {
      setMessages((current) =>
        current.filter((msg) => msg.id !== snapshot.key)
      );
    });

    return () => {
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [messagesQuery]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!realtimeDb) {
      setError("Realtime chat is not configured for this environment.");
      return;
    }
    if (!userId) {
      setError("Not authenticated. Please log in.");
      return;
    }

    try {
      const messagesRef = ref(realtimeDb, `chat/messages/${activeRoomId}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        user: userName || "Anonymous",
        text: text,
        createdAt: Date.now(),
        userId: userId, // Write consistent Prisma user ID
      });
      setInput("");
      setError(null);
    } catch (sendError) {
      console.error("Chat send error:", sendError);
      setError("Failed to send message. Check database rules.");
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!realtimeDb) return;
    const text = editingText.trim();
    if (!text) return;

    try {
      await update(ref(realtimeDb, `chat/messages/${activeRoomId}/${messageId}`), {
        text,
        editedAt: Date.now(),
      });
      setEditingId(null);
    } catch (err) {
      console.error("Failed to edit message:", err);
      setError("Failed to edit message.");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!realtimeDb) return;
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await remove(ref(realtimeDb, `chat/messages/${activeRoomId}/${messageId}`));
    } catch (err) {
      console.error("Failed to delete message:", err);
      setError("Failed to delete message.");
    }
  };

  // Create Direct Message Room
  const startDirectChat = async (targetUser: UserDetail) => {
    if (!realtimeDb) return;
    if (!userId) return;

    // Deterministic room ID based on sorted Prisma User IDs (sorted numerically)
    const sortedIds = [userId, targetUser.id].sort((a, b) => Number(a) - Number(b));
    const roomId = `direct_${sortedIds[0]}_${sortedIds[1]}`;

    // Check if room metadata already exists in local rooms list
    const existing = rooms.find((r) => r.id === roomId);
    if (existing) {
      setActiveRoomId(roomId);
      setIsDirectModalOpen(false);
      setShowSidebarOnMobile(false);
      return;
    }

    const newRoomMetadata: ChatRoomMetadata = {
      id: roomId,
      name: `${userName} & ${targetUser.name}`,
      type: "direct",
      participants: {
        [userId]: true,
        [targetUser.id]: true,
      },
      participantNames: {
        [userId]: userName,
        [targetUser.id]: targetUser.name,
      },
      createdAt: Date.now(),
    };

    try {
      await set(ref(realtimeDb, `chat/rooms/${roomId}`), newRoomMetadata);
      setActiveRoomId(roomId);
      setIsDirectModalOpen(false);
      setShowSidebarOnMobile(false);
    } catch (err) {
      console.error("Error creating direct chat room:", err);
      setError("Failed to start direct chat.");
    }
  };

  // Create Group Chat Room
  const createGroupChat = async () => {
    if (!realtimeDb || !newGroupName.trim()) return;
    if (!userId) return;

    const roomId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const participantsMap: Record<string, boolean> = {
      [userId]: true,
    };
    const participantNamesMap: Record<string, string> = {
      [userId]: userName,
    };

    selectedGroupUsers.forEach((usrId) => {
      participantsMap[usrId] = true;
      const usrObj = availableUsers.find((u) => u.id === usrId);
      if (usrObj) {
        participantNamesMap[usrId] = usrObj.name;
      }
    });

    const newGroupMetadata: ChatRoomMetadata = {
      id: roomId,
      name: newGroupName.trim(),
      type: "group",
      participants: participantsMap,
      participantNames: participantNamesMap,
      createdAt: Date.now(),
      createdBy: userId,
    };

    try {
      await set(ref(realtimeDb, `chat/rooms/${roomId}`), newGroupMetadata);
      setActiveRoomId(roomId);
      setNewGroupName("");
      setSelectedGroupUsers([]);
      setIsGroupModalOpen(false);
      setShowSidebarOnMobile(false);
    } catch (err) {
      console.error("Error creating group room:", err);
      setError("Failed to create group.");
    }
  };

  // Get dynamic room display name
  const getRoomDisplayName = (room: ChatRoomMetadata) => {
    if (room.type === "direct" && room.participantNames) {
      const otherId = Object.keys(room.participants || {}).find(
        (id) => id !== userId
      );
      if (otherId && room.participantNames[otherId]) {
        return room.participantNames[otherId];
      }
    }
    return room.name;
  };

  // Active room details
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // Search filtered users (privacy: only show if search query is entered, and only search by name)
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return availableUsers.filter((u) => u.name.toLowerCase().includes(term));
  }, [availableUsers, searchTerm]);

  return (
    <div className="flex h-[75vh] min-h-[550px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-lg">
      
      {/* Sidebar Panel */}
      <div
        className={`${
          showSidebarOnMobile ? "flex" : "hidden"
        } w-full flex-col border-r border-zinc-800 bg-zinc-950 md:flex md:w-80`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="text-lg font-bold text-white">Conversations</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setIsDirectModalOpen(true);
              }}
              title="New Chat"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedGroupUsers([]);
                setIsGroupModalOpen(true);
              }}
              title="Create Group"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto p-2">
          {rooms.map((room) => {
            const isActive = room.id === activeRoomId;
            const displayName = getRoomDisplayName(room);

            return (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  setShowSidebarOnMobile(false);
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/90 text-white shadow shadow-indigo-600/20"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                {/* Room Type Icons */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? "bg-indigo-500" : "bg-zinc-900"
                  }`}
                >
                  {room.type === "global" && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  )}
                  {room.type === "group" && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {room.type === "direct" && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isActive ? "bg-white" : "bg-emerald-400"}`}></span>
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isActive ? "bg-white" : "bg-emerald-500"}`}></span>
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="truncate text-sm font-semibold">{displayName}</div>
                  <div className="truncate text-xs opacity-75 capitalize">{room.type} Room</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area Panel */}
      <div
        className={`${
          !showSidebarOnMobile ? "flex" : "hidden"
        } flex-1 flex-col bg-zinc-950 md:flex`}
      >
        {/* Chat Area Header */}
        <div className="flex h-15 items-center justify-between border-b border-zinc-800 px-5">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            <button
              onClick={() => setShowSidebarOnMobile(true)}
              className="mr-1 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition md:hidden cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {activeRoom ? getRoomDisplayName(activeRoom) : "Chat Room"}
              </h3>
              <p className="text-[11px] text-zinc-500 capitalize">
                {activeRoom ? activeRoom.type : "Public"} Chat
              </p>
            </div>
          </div>
          <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-zinc-400">
            {userName}
          </div>
        </div>

        {/* Message List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <div className="text-center">
                <div className="mb-2 text-3xl">💬</div>
                <div className="text-xs">No messages in this chat. Start the conversation!</div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.userId === userId;
              const isEditing = editingId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  {!isOwn && (
                    <span className="mb-1 ml-2 text-[11px] font-semibold text-zinc-500">
                      {message.user}
                    </span>
                  )}
                  <div
                    className={`group relative flex items-center gap-2 max-w-[85%] sm:max-w-[70%] ${
                      isOwn ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 border text-sm leading-relaxed transition-all duration-200 ${
                        isOwn
                          ? "rounded-tr-none border-indigo-500/20 bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "rounded-tl-none border-zinc-800/80 bg-zinc-900 text-zinc-200"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex min-w-[220px] flex-col gap-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(message.id);
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                            className="w-full resize-none rounded-lg border border-indigo-400 bg-indigo-700/80 p-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-300"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-1.5 text-xs">
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded px-2 py-1 text-indigo-200 hover:text-white transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(message.id)}
                              className="rounded bg-white px-2.5 py-1 font-semibold text-indigo-950 hover:bg-zinc-150 transition shadow"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] opacity-60">
                            <span>{formatTime(message.createdAt)}</span>
                            {message.editedAt && (
                              <span className="italic font-light">(edited)</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hover actions menu for current user's messages */}
                    {isOwn && !isEditing && (
                      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/95 p-1 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(message.id, message.text)}
                          title="Edit Message"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-900 hover:text-indigo-400 transition cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
                          title="Delete Message"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-800 bg-zinc-950 p-4">
          <div className="flex gap-3">
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
              className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleSend}
              className="shrink-0 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Send
            </button>
          </div>
          {error && (
            <div className="mt-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}

      {/* Direct Message modal */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Start a Chat</h3>
              <button
                onClick={() => setIsDirectModalOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
            />

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-sm text-zinc-500 py-4">
                  {searchTerm.trim() === "" ? "Type a username to search..." : "No users found"}
                </div>
              ) : (
                filteredUsers.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => startDirectChat(usr)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-zinc-900/40 border border-zinc-900 px-4 py-3 text-left transition hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 font-semibold text-sm">
                      {usr.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{usr.name}</div>
                      <div className="text-xs text-zinc-500">{usr.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Chat modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create Group Chat</h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Developers"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Select Members</label>
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
                
                <div className="max-h-48 overflow-y-auto border border-zinc-900 bg-zinc-950/40 rounded-2xl p-2 space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center text-xs text-zinc-500 py-4">
                      {searchTerm.trim() === "" ? "Type a username to search..." : "No users found"}
                    </div>
                  ) : (
                    filteredUsers.map((usr) => {
                      const isSelected = selectedGroupUsers.includes(usr.id);
                      return (
                        <button
                          key={usr.id}
                          onClick={() => {
                            setSelectedGroupUsers((prev) =>
                              isSelected ? prev.filter((id) => id !== usr.id) : [...prev, usr.id]
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                            isSelected ? "bg-indigo-950/30 text-indigo-200 border border-indigo-500/20" : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold">
                              {usr.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium">{usr.name}</span>
                          </div>
                          <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "border-zinc-800"}`}>
                            {isSelected && (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                disabled={!newGroupName.trim() || selectedGroupUsers.length === 0}
                onClick={createGroupChat}
                className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Create Group ({selectedGroupUsers.length} members)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
