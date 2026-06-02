"use server";

import { prisma } from "@/lib/prisma";
import { updateTag } from "next/cache";
import { auth } from "@/auth";

export async function createComment(
    postId: number,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("To comment on this post, you must be logged in.");
    }

    const content = formData.get("content") as string;

    if (!content.trim()) {
        return;
    }

    await prisma.comment.create({
        data: {
            content,
            authorId: Number(session.user.id),
            postId,
        },
    });

    updateTag(`post-${postId}-comments`);
}
