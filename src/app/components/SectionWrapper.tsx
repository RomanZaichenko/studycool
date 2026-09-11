import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface SectionWrapperProps {
  title: string;
  children: ReactNode;
  isLineShown?: boolean;
  headerControls?: ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function SectionWrapper({
  title,
  children,
  isLineShown,
  headerControls,
  isCollapsed = false,
  onToggleCollapse,
}: SectionWrapperProps) {
  return (
    <section className="mt-9 w-full pr-4 pl-4 md:pr-9 md:pl-9">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          disabled={!onToggleCollapse}
          className={`group flex items-center gap-2 transition-opacity ${
            onToggleCollapse
              ? "cursor-pointer hover:opacity-70"
              : "cursor-default"
          }`}
          aria-label={isCollapsed ? "Open section" : "Collapse section"}
        >
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>

          {onToggleCollapse && (
            <ChevronDown
              strokeWidth={2}
              className={`mt-[-15px] h-10 w-10 text-[#626060] transition-transform duration-200 ${
                isCollapsed ? "-rotate-90" : "rotate-0"
              }`}
            />
          )}
        </button>

        {headerControls && <div>{headerControls}</div>}
      </div>

      {!isCollapsed && (
        <div className="mb-5 flex flex-wrap items-start">{children}</div>
      )}

      {isLineShown && (
        <hr className="mb-9 w-full border-t border-[#333] opacity-20" />
      )}
    </section>
  );
}
