"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
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
        communityIds: formData.getAll("communityIds"),
    };

    const validatedFields = createPostSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, content, communityIds } = validatedFields.data;
    const authorId = Number(session.user.id);

    let firstPost;
    try {
        const posts = await prisma.$transaction(
            communityIds.map((communityId) =>
                prisma.posts.create({
                    data: {
                        title,
                        content,
                        authorId,
                        communityId,
                    },
                })
            )
        );
        firstPost = posts[0];
    } catch (error) {
        console.error("Failed to create post:", error);
        return {
            errors: {
                title: ["Failed to save post. Please try again."],
            },
        };
    }

    updateTag("posts");
    redirect(firstPost ? `/post/${firstPost.id}` : "/");
}

export async function updatePost(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            errors: {
                title: ["You must be logged in to edit a post."],
            },
        };
    }

    const rawData = {
        id: formData.get("id"),
        title: formData.get("title"),
        content: formData.get("content"),
    };

    const validatedFields = updatePostSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, title, content } = validatedFields.data;

    try {
        const post = await prisma.posts.findUnique({
            where: { id },
            select: { authorId: true },
        });

        if (!post) {
            return {
                errors: {
                    title: ["Post not found."],
                },
            };
        }

        if (post.authorId !== Number(session.user.id)) {
            return {
                errors: {
                    title: ["You are not authorized to edit this post."],
                },
            };
        }

        await prisma.posts.update({
            where: { id },
            data: {
                title,
                content,
            },
        });
    } catch (error) {
        console.error("Failed to update post:", error);
        return {
            errors: {
                title: ["Failed to save post. Please try again."],
            },
        };
    }

    updateTag("posts");
    updateTag(`post-${id}`);
    redirect(`/post/${id}`);
}

export async function deletePost(postId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in to delete a post.");
    }

    const post = await prisma.posts.findUnique({
        where: { id: postId },
        select: { authorId: true },
    });

    if (!post) {
        throw new Error("Post not found.");
    }

    if (post.authorId !== Number(session.user.id)) {
        throw new Error("You are not authorized to delete this post.");
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Delete all comments first due to constraints
            await tx.comment.deleteMany({
                where: { postId },
            });
            // Delete the post
            await tx.posts.delete({
                where: { id: postId },
            });
        });
    } catch (error) {
        console.error("Failed to delete post:", error);
        throw new Error("Failed to delete post. Please try again.");
    }

    updateTag("posts");
    updateTag(`post-${postId}`);
    redirect("/");
}

export async function votePost(postId: number, value: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in to vote.");
    }

    const userId = Number(session.user.id);

    if (value !== 1 && value !== -1 && value !== 0) {
        throw new Error("Invalid vote value.");
    }

    try {
        if (value === 0) {
            await prisma.vote.deleteMany({
                where: {
                    userId,
                    postId,
                },
            });
        } else {
            await prisma.vote.upsert({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
                update: {
                    value,
                },
                create: {
                    userId,
                    postId,
                    value,
                },
            });
        }
    } catch (error) {
        console.error("Failed to register vote:", error);
        throw new Error("Failed to vote. Please try again.");
    }

    updateTag("posts");
    updateTag(`post-${postId}`);
}