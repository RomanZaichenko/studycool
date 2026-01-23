import Image from "next/image";

export default function ProjectCard({title}: {title:string}) {
  return (
    <>
      {/*TODO: find some common design or make some different 
        images for projects cards*/}
      <Image 
        src="/"
        width={200}
        height={105}
        alt={"Project Image"}
        style ={{
          fontSize: "12px",
          marginRight: "5px",
        }}
      />

      <hr className="text-[#333] opacity-20" />

      <h3 className="font-victor text-[#B5B2B2] text-2xl pl-3">{title}</h3>
    </>
  )
}