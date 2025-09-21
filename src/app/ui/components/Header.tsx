import Image from "next/image";
import {Searcher} from "@/app/ui/components/Searcher";

export function Header() {
  return (
    <header className="bg-[#504679] w-full h-[5vw] flex justify-between items-center">
      <Image src={"/icons/person.svg"}
             alt="Person"
             width="20"
             height="20"
             className="ml-10 "
              />

      <Searcher/>
    </header>
  )
}