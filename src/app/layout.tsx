import type { Metadata } from "next";
import "./ui/globals.css"; // Твоя краса
import { auth } from "@/auth"; // Твої мізки
import { Header } from "@/app/components/Header";
import { SettingsModal } from "@/app/components/SettingsModal";

export const metadata: Metadata = {
  title: "StudyCool",
  description: "Platform for effective studying and saving notes",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="bg-[#efefef]">
        <Header session={session} />

        <main className="flex h-screen w-screen flex-col pt-16">
          {children}
        </main>

        <SettingsModal />
      </body>
    </html>
  );
}