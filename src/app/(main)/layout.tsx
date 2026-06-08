import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BackToHome from "@/components/shared/BackToHome";

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

        <section className="min-h-screen flex-1 px-4 py-4 md:px-6 md:py-6">
          <BackToHome />
          {children}
        </section>

        <RightSidebar />
      </main>
    </div>
  );
}
