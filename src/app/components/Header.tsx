"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Searcher from "./Searcher";
import { AIChatHeaderButton } from "./AIChatHeaderButton";
import { SignInModal } from "./SignInModal";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const router = useRouter();

  const { isAuthenticated, user, openSignInModal, logout } = useAuthStore();

  return (
    <header className="bg-primary-color fixed top-0 left-0 z-[2000] flex h-16 w-full items-center justify-between px-6 shadow-sm">
      <Image
        src={"/icons/home.svg"}
        alt="Home"
        width="35"
        height="35"
        className="cursor-pointer transition-opacity hover:opacity-80"
        onClick={() => router.push("/")}
      />

      <div className="flex items-center gap-4">
        <Searcher />
        <AIChatHeaderButton />

        {isAuthenticated && user ? (
          <div className="group relative cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-600 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105">
              {user.initials}
            </div>

            <div className="absolute top-full right-0 hidden w-48 pt-2 group-hover:block">
              <div className="flex flex-col rounded-sm border border-gray-200 bg-white shadow-lg">
                <button className="px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  Profile
                </button>
                <button className="px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="border-t border-gray-100 px-4 py-3 text-left text-sm font-bold text-red-600 transition-colors hover:bg-gray-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={openSignInModal}
            className="rounded-sm bg-white px-6 py-2 text-sm font-bold text-gray-800 shadow-sm transition-all hover:bg-gray-100 active:scale-95"
          >
            Sign In
          </button>
        )}
      </div>

      <SignInModal />
    </header>
  );
}
