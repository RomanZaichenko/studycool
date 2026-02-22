import Image from "next/image";
import Searcher from "./Searcher";

export function Header() {
  return (
    <header className="bg-primary-color flex h-16 w-full items-center justify-between">
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
