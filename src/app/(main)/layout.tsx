import Navbar from "@/components/layout/navbar";
import LeftSidebar from "@/components/layout/left-sidebar";
import RightSidebar from "@/components/layout/right-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto flex max-w-7xl">
        <LeftSidebar />

        <section className="min-h-screen flex-1 px-6 py-6">
          {children}
        </section>

        <RightSidebar />
      </main>
    </div>
  );
}
