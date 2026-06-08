import { z } from "zod";

export const createCommunitySchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters"),

    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        ),

    description: z
        .string()
        .min(
            10,
            "Description must be at least 10 characters"
        ),
});

export const updateCommunitySchema = z.object({
    slug: z.string(),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters"),
    description: z
        .string()
        .min(
            10,
            "Description must be at least 10 characters"
        ),
});