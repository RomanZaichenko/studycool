"use client";

import Image from "next/image";
import { useState, useRef, useEffect, } from "react";



const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 font-bold text-gray-900 rounded-sm px-[2px]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default function Searcher({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={searchRef}
      className={`relative mr-4 w-40 sm:w-56 md:mr-8 md:w-80 lg:w-[400px] ${className}`}
    >

      <div className="focus-within:border-primary-color flex h-10 w-full items-center rounded-sm border border-transparent bg-white shadow-sm transition-colors">
        <input
          type="text"
          placeholder="Search note"
          aria-label="Searcher"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="font-victor h-full w-full bg-transparent pl-3 text-sm text-zinc-700 outline-none placeholder:text-gray-400 md:text-base"
        />

        <button className="border-ui-border-color flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center border-l-2 transition-colors hover:bg-gray-50">
          <Image
            src={"/icons/searcher.svg"}
            alt="Searcher"
            width={20}
            height={20}
          />
        </button>
      </div>

      {isOpen && query.length > 0 && (
        <div 
          className="absolute left-0 top-full mt-2 w-full rounded-md bg-[#f3f4f6] p-2 shadow-lg z-50 overflow-y-auto max-h-[360px] 
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
          {filteredResults.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {filteredResults.map((result) => (
                <li
                  key={result.id}
                  className="flex cursor-pointer flex-col rounded bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <span className="text-base font-semibold text-gray-800">
                    <HighlightText text={result.title} highlight={query} />
                  </span>
                  <span className="mt-1 font-mono text-xs text-gray-400">
                    <HighlightText text={result.path} highlight={query} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Нічого не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}