"use client";

import { useState, useEffect, useTransition } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { loginAction, registerAction, logInWithGoogleAction } from "@/app/actions/auth.actions";

export function SignInModal() {
  const { isSignInModalOpen, closeSignInModal } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isSignInModalOpen) {
      setTimeout(() => {
        setMode("signin");
        setName("");
        setEmail("");
        setPassword("");
        setError(null);
      }, 200);
    }
  }, [isSignInModalOpen]);

  if (!isSignInModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === "signup") {
        const res = await registerAction(name, email, password);
        if (res?.error) setError(res.error);
      } else {
        const res = await loginAction(email, password);
        if (res?.error) setError(res.error);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#111111]/80 p-4 font-sans backdrop-blur-sm transition-opacity"
      onClick={closeSignInModal}
    >
      <div
        className="relative w-full max-w-md rounded-md bg-[#f0f0f0] p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeSignInModal}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#333333]">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="rounded bg-white px-4 py-1.5 text-sm font-semibold text-[#333333] shadow-sm transition-colors hover:bg-gray-50"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm font-medium text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="animate-in fade-in slide-in-from-top-2 w-full rounded border-none bg-white px-4 py-3 text-sm text-[#333333] shadow-sm transition-colors outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#27ae60]/50"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border-none bg-white px-4 py-3 text-sm text-[#333333] shadow-sm transition-colors outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#27ae60]/50"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border-none bg-white px-4 py-3 text-sm text-[#333333] shadow-sm transition-colors outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#27ae60]/50"
            required
            minLength={6}
          />

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded bg-[#27ae60] px-4 py-3 text-center text-lg font-bold text-white shadow-sm transition-colors hover:bg-[#219653] disabled:opacity-50"
            >
              {isPending ? "Зачекайте..." : mode === "signin" ? "Login" : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => logInWithGoogleAction()}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded bg-[#333333] text-white shadow-sm transition-colors hover:bg-[#222222]"
              aria-label="Continue with Google"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.642 10.1983C19.642 9.53303 19.5822 8.89304 19.4715 8.27832H10V11.9167H15.4044C15.1717 13.1703 14.463 14.2309 13.3999 14.9427V17.3006H16.6475C18.5471 15.5518 19.642 12.9565 19.642 10.1983Z" fill="#4285F4" />
                <path d="M10 20C12.7 20 14.9625 19.1042 16.6475 17.3006L13.3999 14.9427C12.503 15.5422 11.3533 15.8988 10 15.8988C7.38956 15.8988 5.17744 14.1363 4.3875 11.7691H1.036V13.3769C2.69089 17.3106 6.30722 20 10 20Z" fill="#34A853" />
                <path d="M4.3875 11.7691C4.18739 11.1691 4.07222 10.531 4.07222 9.87222C4.07222 9.21339 4.18739 8.57522 4.3875 7.97522V6.36744H1.036C0.374444 7.42056 0 8.60744 0 9.87222C0 11.1369 0.374444 12.3239 1.036 13.3769L4.3875 11.7691Z" fill="#FBBC05" />
                <path d="M10 4.10117C11.47 4.10117 12.7889 4.60778 13.8311 5.60278L16.7194 2.71444C14.96 1.03444 12.6975 0 10 0C6.30722 0 2.69089 2.68939 1.036 6.36744L4.3875 7.97522C5.17744 5.60806 7.38956 4.10117 10 4.10117Z" fill="#EA4335" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}