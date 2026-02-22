import { ReactNode } from "react";

interface SectionWrapperProps {
  title: string;
  children: ReactNode;
  isLineShown?: boolean;
}

export default function SectionWrapper({
  title,
  children,
  isLineShown,
}: SectionWrapperProps) {
  return (
    <section className="mt-9 w-full pr-4 pl-4 md:pr-9 md:pl-9">
      <h2 className="mb-6 text-2xl font-semibold">{title}</h2>

      <div className="mb-5 flex flex-wrap items-start">{children}</div>

      {isLineShown && (
        <hr className="mb-9 w-full border-t border-[#333] opacity-20" />
      )}
    </section>
  );
}
