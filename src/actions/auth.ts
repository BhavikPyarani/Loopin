"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/register";
import { loginSchema } from "@/lib/validations/auth";

export async function registerUser(
    prevState: unknown,
    formData: FormData
) {
    let success = false;

    try {
        const validatedFields = registerSchema.safeParse({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
        });

        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { name, email, password } = validatedFields.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return {
                errors: {
                    email: ["Email already exists"],
                },
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

        if (firebaseApiKey) {
            const firebaseResponse = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        returnSecureToken: true,
                    }),
                }
            );

            if (!firebaseResponse.ok) {
                const responseBody = await firebaseResponse.json().catch(() => null);
                const firebaseError = responseBody?.error?.message;

                // Keep registration successful even when Firebase is unavailable.
                // Credentials auth uses the database user, so this should not block sign-up.
                if (
                    firebaseError &&
                    firebaseError !== "CONFIGURATION_NOT_FOUND"
                ) {
                    console.warn(
                        "Firebase sign-up failed for new user:",
                        firebaseError
                    );
                }
            }
        }

        success = true;
    } catch (error: unknown) {
        console.error("Registration error:", error);
        const message = error instanceof Error ? error.message : String(error);
        return {
            error: `Registration error: ${message}`,
        };
    }

    if (success) {
        redirect("/login");
    }
}

export async function loginUser(
    prevState: unknown,
    formData: FormData
) {
    const validatedFields = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {
                        error: "Invalid email or password.",
                    };
                default:
                    return {
                        error: "Something went wrong. Please try again.",
                    };
            }
        }
        throw error;
    }
}