"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createCommunitySchema, updateCommunitySchema } from "@/lib/validations/community";
import { updateTag } from "next/cache";

export async function createCommunity(
    prevState: any,
    formData: FormData
) {
    const rawData = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        description: formData.get("description"),
    };

    const validatedFields =
        createCommunitySchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, slug, description } = validatedFields.data;

    const existing = await prisma.community.findUnique({
        where: { slug },
    });

    if (existing) {
        return {
            errors: {
                slug: ["A community with this slug already exists."],
            },
        };
    }

    const session = await auth();
    if (!session?.user?.id) {
        return {
            errors: {
                slug: ["You must be logged in to create a community."],
            },
        };
    }

    await prisma.community.create({
        data: {
            name,
            slug,
            description,
            creatorId: Number(session.user.id),
        },
    });

    updateTag("communities");
    redirect(`/communities/${slug}`);
}

export async function updateCommunity(
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            errors: {
                name: ["You must be logged in to edit a community."],
            },
        };
    }

    const rawData = {
        slug: formData.get("slug"),
        name: formData.get("name"),
        description: formData.get("description"),
    };

    const validatedFields = updateCommunitySchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { slug, name, description } = validatedFields.data;

    try {
        const community = await prisma.community.findUnique({
            where: { slug },
            select: { creatorId: true },
        });

        if (!community) {
            return {
                errors: {
                    name: ["Community not found."],
                },
            };
        }

        if (community.creatorId !== Number(session.user.id)) {
            return {
                errors: {
                    name: ["You are not authorized to edit this community."],
                },
            };
        }

        await prisma.community.update({
            where: { slug },
            data: {
                name,
                description,
            },
        });
    } catch (error) {
        console.error("Failed to update community:", error);
        return {
            errors: {
                name: ["Failed to save community. Please try again."],
            },
        };
    }

    updateTag("communities");
    updateTag(`community-${slug}`);
    redirect(`/communities/${slug}`);
}

export async function deleteCommunity(slug: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in to delete a community.");
    }

    const community = await prisma.community.findUnique({
        where: { slug },
        select: { id: true, creatorId: true },
    });

    if (!community) {
        throw new Error("Community not found.");
    }

    if (community.creatorId !== Number(session.user.id)) {
        throw new Error("You are not authorized to delete this community.");
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Find all posts in the community
            const posts = await tx.posts.findMany({
                where: { communityId: community.id },
                select: { id: true },
            });
            const postIds = posts.map((p) => p.id);

            if (postIds.length > 0) {
                // Delete comments for all posts in the community
                await tx.comment.deleteMany({
                    where: { postId: { in: postIds } },
                });
                // Delete posts
                await tx.posts.deleteMany({
                    where: { communityId: community.id },
                });
            }

            // Delete the community
            await tx.community.delete({
                where: { id: community.id },
            });
        });
    } catch (error) {
        console.error("Failed to delete community:", error);
        throw new Error("Failed to delete community. Please try again.");
    }

    updateTag("communities");
    updateTag(`community-${slug}`);
    redirect("/");
}
