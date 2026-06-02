import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function test() {
    try {
        console.log("Connecting to database...");
        const email = `test-${Date.now()}@example.com`;
        const passwordHash = await bcrypt.hash("password123", 10);
        
        console.log(`Attempting to create user with email: ${email}`);
        const user = await prisma.user.create({
            data: {
                name: "Test User",
                email: email,
                passwordHash: passwordHash,
            },
        });
        
        console.log("User successfully created:", user);
    } catch (error) {
        console.error("Database connection/creation failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
