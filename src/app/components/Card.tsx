import { cn } from "@/app/lib/utils";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className }: CardProps) {
  return (
    <div
      className={cn(
        "flex h-[100px] w-[160px] shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm md:h-35 md:w-55",
        "transition-all hover:shadow-md active:scale-95",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-gray-50">
        {children}
      </div>
      <h3 className="font-victor border-ui-border-color text-ui-text-color flex h-8 shrink-0 items-center truncate border-t pl-2 text-sm md:h-10 md:pl-3 md:text-xl">
        {title}
      </h3>
    </div>
  );
}
