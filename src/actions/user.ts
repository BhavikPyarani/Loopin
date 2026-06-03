"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getUsers() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentUserId = Number(session.user.id);
  if (isNaN(currentUserId)) {
    throw new Error("Invalid session user ID");
  }

  // Fetch all users except the current logged-in user
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: currentUserId,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return users.map((u) => ({
    id: String(u.id),
    name: u.name,
    email: u.email,
  }));
}
