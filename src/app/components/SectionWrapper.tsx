import { ReactNode } from "react";

interface SectionWrapperProps {
  title: string;
  children: ReactNode;
  isLineShown?: boolean;
}

export default function SectionWrapper({ title, children, isLineShown }: 
  SectionWrapperProps) {
    
  return (
    <section className="ml-9 mt-9 w-full">
      <h2>{title}</h2>

      <div className="flex flex-wrap mb-5">
        {children}
      </div>

      {isLineShown && 
        <hr className="w-[70vw] text-[#333] border-1 opacity-20"/>}
    </section>
  )
}