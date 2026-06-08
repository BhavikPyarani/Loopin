import { cookies } from "next/headers";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Forces this layout and its child pages to render dynamically at request time
  await cookies();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full">{children}</div>
    </main>
  );
}
