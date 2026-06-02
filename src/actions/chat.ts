"use client";

import { realtimeDb } from "@/lib/firebase";
import { push, ref } from "firebase/database";

export async function sendChatMessage(message: string, userName: string, firebaseUid: string) {
    if (!firebaseUid) {
        throw new Error("You must be logged in to send messages");
    }

    if (!message.trim()) {
        throw new Error("Message cannot be empty");
    }

    try {
        await push(ref(realtimeDb, "chat/messages"), {
            user: userName || "Anonymous",
            text: message.trim(),
            createdAt: Date.now(),
            userId: firebaseUid,
        });
    } catch (error) {
        console.error("Firebase write error:", error);
        throw new Error(
            "Failed to send message. Check Firebase security rules."
        );
    }
}
