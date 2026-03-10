import Image from "next/image";
import Searcher from "./Searcher";

export function Header() {
  return (
    <header className="bg-primary-color flex h-16 w-full items-center justify-between fixed top-0 left-0">
      <Image
        src={"/icons/person.svg"}
        alt="Person"
        width="20"
        height="20"
        className="ml-10"
      />

      <Searcher />
    </header>
  );
}
