import { z } from "zod";

export const createPostSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters"),
    content: z
        .string()
        .min(10, "Content must be at least 10 characters"),
    communityIds: z.array(z.coerce.number().int().positive())
        .min(1, "Please select at least one community"),
});

export const updatePostSchema = z.object({
    id: z.coerce.number().int().positive(),
    title: z
        .string()
        .min(3, "Title must be at least 3 characters"),
    content: z
        .string()
        .min(10, "Content must be at least 10 characters"),
});
