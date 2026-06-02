"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createCommunitySchema } from "@/lib/validations/community";
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
