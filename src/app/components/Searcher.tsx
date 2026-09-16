"use client";

import Image from "next/image";
import {
  useGlobalSearch,
  type GlobalSearchResult,
} from "@/app/hooks/useGlobalSearch";

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="rounded-sm bg-yellow-200 px-[2px] font-bold text-gray-900"
          >
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
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    searchRef,
    filteredResults,
    isSearching,
    handleNavigate,
  } = useGlobalSearch();

  return (
    <div
      ref={searchRef}
      className={`relative mr-4 w-40 sm:w-56 md:mr-8 md:w-80 lg:w-[400px] ${className}`}
    >
      <div className="focus-within:border-primary-color flex h-10 w-full items-center rounded-sm border border-transparent bg-white shadow-sm transition-colors">
        <input
          type="text"
          placeholder="Пошук..."
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
            src="/icons/searcher.svg"
            alt="Search"
            width={20}
            height={20}
            style={{ width: "20px", height: "auto" }}
          />
        </button>
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-2 max-h-[360px] w-full overflow-y-auto rounded-md bg-[#f3f4f6] p-2 shadow-lg">
          {isSearching ? (
            <div className="animate-pulse p-4 text-center text-sm text-gray-500">
              Пошук...
            </div>
          ) : filteredResults.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {filteredResults.map((result: GlobalSearchResult) => (
                <li
                  key={result.id}
                  onClick={() => handleNavigate(result)}
                  className="flex cursor-pointer flex-col rounded bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-800">
                      <HighlightText text={result.title} highlight={query} />
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        result.type === "project"
                          ? "bg-purple-100 text-purple-600"
                          : result.type === "map"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      {result.type === "project"
                        ? "Проєкт"
                        : result.type === "map"
                          ? "Мапа"
                          : "Нотатка"}
                    </span>
                  </div>

                  {result.contentSnippet && (
                    <div className="mb-1 text-sm leading-relaxed text-gray-600">
                      <span className="mr-1 text-[10px] font-bold text-gray-400 uppercase">
                        Текст:
                      </span>
                      <HighlightText
                        text={result.contentSnippet}
                        highlight={query}
                      />
                    </div>
                  )}

                  {result.path && (
                    <span className="mt-auto font-mono text-[10px] text-gray-400">
                      {result.path}
                    </span>
                  )}
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
