import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {

    const userBhavik = await prisma.user.create({
        data: {
            name: "Bhavik",
            email: "bhavik@example.com",
            passwordHash: "$2b$10$A3N4iRjv4f7V5P8nQmY4FeQvZ3qM7m3xK4xqz3Xv8LQ6dM8aJvK9S",
        },
    });

    const userAlex = await prisma.user.create({
        data: {
            name: "Alex",
            email: "alex@example.com",
            passwordHash: "$2b$10$A3N4iRjv4f7V5P8nQmY4FeQvZ3qM7m3xK4xqz3Xv8LQ6dM8aJvK9S",
        },
    });

    const userSarah = await prisma.user.create({
        data: {
            name: "Sarah",
            email: "sarah@example.com",
            passwordHash: "$2b$10$A3N4iRjv4f7V5P8nQmY4FeQvZ3qM7m3xK4xqz3Xv8LQ6dM8aJvK9S",
        },
    });

    const userJohn = await prisma.user.create({
        data: {
            name: "John",
            email: "john@example.com",
            passwordHash: "$2b$10$A3N4iRjv4f7V5P8nQmY4FeQvZ3qM7m3xK4xqz3Xv8LQ6dM8aJvK9S",
        },
    });

    const result = await prisma.community.createMany({
        data: [
            {
                name: "Next.js",
                slug: "nextjs",
                description:
                    "Discussions about the Next.js framework and modern React architecture.",
                creatorId: userBhavik.id,
            },
            {
                name: "React",
                slug: "react",
                description:
                    "Everything related to React ecosystem and frontend development.",
                creatorId: userBhavik.id,
            },
            {
                name: "TypeScript",
                slug: "typescript",
                description:
                    "Strongly typed JavaScript discussions and best practices.",
                creatorId: userBhavik.id,
            },
        ],
        skipDuplicates: true,
    });

    const nextJsCommunity = await prisma.community.findUnique({
        where: {
            slug: 'nextjs'
        }
    });

    const reactCommunity = await prisma.community.findUnique({
        where: {
            slug: 'react'
        }
    });

    const typescriptCommunity = await prisma.community.findUnique({
        where: {
            slug: 'typescript'
        }
    });

    if (!nextJsCommunity || !reactCommunity || !typescriptCommunity) {
        throw new Error("Could not find all seeded communities");
    }

    const post1 = await prisma.posts.create({
        data: {
            title: "Why App Router changed React architecture",
            content:
                "Server Components completely changed frontend architecture patterns.",
            authorId: userBhavik.id,
            communityId: nextJsCommunity.id,
        },
    });

    const post2 = await prisma.posts.create({
        data: {
            title: "Composition is the real React superpower",
            content:
                "Reusable component composition scales applications beautifully.",
            authorId: userAlex.id,
            communityId: reactCommunity.id,
        },
    });

    const post3 = await prisma.posts.create({
        data: {
            title: "Why TypeScript enables fearless refactoring",
            content:
                "Type safety prevents bugs and makes refactoring safe.",
            authorId: userSarah.id,
            communityId: typescriptCommunity.id,
        },
    });

    await prisma.comment.createMany({
        data: [
            {
                postId: post1.id,
                authorId: userAlex.id,
                content: "App Router completely changed how I think about React architecture.",
            },
            {
                postId: post1.id,
                authorId: userSarah.id,
                content: "Server Components initially felt confusing but now they make so much sense.",
            },
            {
                postId: post2.id,
                authorId: userJohn.id,
                content: "Composition patterns are honestly one of the most important React concepts.",
            },
        ],
    });

    console.log(`Database seeded successfully. Inserted ${result.count} communities.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
