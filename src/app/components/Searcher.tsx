import Image from "next/image";

export default function Searcher({ className = "" }: { className?: string }) {
  return (
    <div
      id="searcher"
      className={`focus-within:border-primary-color mr-4 flex w-40 items-center rounded-sm border border-transparent bg-white shadow-sm transition-colors sm:w-56 md:mr-8 md:w-80 lg:w-[400px] ${className}`}
    >
      <input
        type="text"
        placeholder="Search note"
        aria-label="Searcher"
        className="font-victor h-8 w-full bg-transparent pl-3 text-sm text-zinc-500 outline-none placeholder:text-gray-400 md:text-base"
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
  );
}
