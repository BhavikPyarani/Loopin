import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateCommunityForm from "@/components/forms/create-community-form";
import { Suspense } from "react";

export default function CreateCommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-md border border-zinc-800 bg-zinc-900" />
      }
    >
      <CreateCommunityContent />
    </Suspense>
  );
}

async function CreateCommunityContent() {
  const session = await auth();
  if (!session) redirect("/login");
  return <CreateCommunityForm />;
}
