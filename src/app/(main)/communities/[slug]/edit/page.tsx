import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import EditCommunityForm from "@/components/forms/EditCommunityForm";

type EditCommunityPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditCommunityPage(props: EditCommunityPageProps) {
  const { slug } = await props.params;

  const [community, session] = await Promise.all([
    prisma.community.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        creatorId: true,
      },
    }),
    auth(),
  ]);

  if (!community) {
    notFound();
  }

  if (!session?.user?.id || community.creatorId !== Number(session.user.id)) {
    redirect(`/communities/${slug}`);
  }

  return <EditCommunityForm community={community} />;
}
