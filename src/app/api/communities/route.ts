import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createCommunitySchema } from "@/lib/validations/community";
import { updateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create a community." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validatedFields = createCommunitySchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { errors: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, description } = validatedFields.data;

    const existing = await prisma.community.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { errors: { slug: ["A community with this slug already exists."] } },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        creatorId: Number(session.user.id),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    updateTag("communities");

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("API community creation error:", error);
    return NextResponse.json(
      { error: "Failed to create community. Please try again." },
      { status: 500 }
    );
  }
}
