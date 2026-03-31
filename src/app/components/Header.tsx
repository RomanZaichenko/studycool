"use client";

import Image from "next/image";
import Searcher from "./Searcher";
import { useRouter } from "next/navigation";
import { AIChatHeaderButton } from "./AIChatHeaderButton";

export function Header() {
  const router = useRouter();

  return (
    <header className="bg-primary-color fixed top-0 left-0 z-1 flex h-16 w-full items-center justify-between">
      <Image
        src={"/icons/home.svg"}
        alt="Person"
        width="35"
        height="35"
        className="ml-10 cursor-pointer"
        onClick={() => router.push("/")}
      />
      <div className="flex pr-3">
        <Searcher />
        <AIChatHeaderButton />
      </div>
    </header>
  );
}
