import { auth } from "@/auth";
import { Header } from "@/app/components/Header";
import { SettingsModal } from "@/app/components/SettingsModal";

export default async function HeaderLayout({ children }: { children: React.ReactNode }) {
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