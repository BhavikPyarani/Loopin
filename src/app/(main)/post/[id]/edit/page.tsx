import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import EditPostForm from "@/components/forms/EditPostForm";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage(props: EditPostPageProps) {
  const { id } = await props.params;
  const postId = Number(id);

  const [post, session] = await Promise.all([
    prisma.posts.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
      },
    }),
    auth(),
  ]);

  if (!post) {
    notFound();
  }

  if (!session?.user?.id || post.authorId !== Number(session.user.id)) {
    redirect(`/post/${postId}`);
  }

  return <EditPostForm post={post} />;
}
