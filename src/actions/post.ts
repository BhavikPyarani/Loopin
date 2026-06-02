"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createPostSchema } from "@/lib/validations/post";
import { updateTag } from "next/cache";

export async function createPost(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            errors: {
                title: ["You must be logged in to create a post."],
            },
        };
    }

    const rawData = {
        title: formData.get("title"),
        content: formData.get("content"),
        communityId: formData.get("communityId"),
    };

    const validatedFields = createPostSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, content, communityId } = validatedFields.data;

    let post;
    try {
        post = await prisma.posts.create({
            data: {
                title,
                content,
                authorId: Number(session.user.id),
                communityId,
            },
        });
    } catch (error) {
        console.error("Failed to create post:", error);
        return {
            errors: {
                title: ["Failed to save post. Please try again."],
            },
        };
    }

    updateTag("posts");
    redirect(`/post/${post.id}`);
}