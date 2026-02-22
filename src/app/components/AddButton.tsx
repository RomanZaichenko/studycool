import { cn } from "@/app/lib/utils";

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export default function AddButton({ className, ...props }: AddButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-[100px] w-[160px] shrink-0 cursor-pointer items-center justify-center self-start rounded-lg bg-white shadow-sm transition-all hover:shadow-md active:scale-95 md:h-35 md:w-55",
        className
      )}
    >
      <svg viewBox="0 0 100 100" className="h-12 w-12 md:h-20 md:w-20">
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="white"
          stroke="currentColor"
          strokeWidth="1"
          className="text-ui-light-stroke"
        />
        <line
          x1="30"
          y1="50"
          x2="70"
          y2="50"
          stroke="currentColor"
          strokeWidth="3"
          className="text-ui-dark-stroke"
        />
        <line
          x1="50"
          y1="30"
          x2="50"
          y2="70"
          stroke="currentColor"
          strokeWidth="3"
          className="text-ui-dark-stroke"
        />
      </svg>
    </button>
  );
}
