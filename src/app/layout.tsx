import {Metadata} from "next";
import "./ui/globals.css"
import {Header} from "@/app/components/Header";

"./ui/Header.tsx"


export const metadata: Metadata = {
  title: "StudyCool",
  description: "Platform for effective studying and saving notes"
};

export default function HeaderLayout({children}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#efefef]">
        <Header/>
        <main className={"mt-6 pl-4"}>{children}</main>
      </body>
    </html>
  );
}