import Image from "next/image";



export function Searcher() {
  return (
    <div id="searcher" className="flex items-center">
      <input type="text" placeholder="Search note"
             className=" bg-white text-zinc-500 h-8 w-100  rounded-sm pl-3
             placeholder:text-gray-400 "/>
      <button className={"border-l-2 border-[#DEDADA] mr-30  " +
        " w-10 ml-[-3vw] pl-2 cursor-pointer"}>
        <Image src={"/icons/searcher.svg"} alt="Searcher" width={30} height={30}
                className={""} />
      </button>
    </div>
  )
}