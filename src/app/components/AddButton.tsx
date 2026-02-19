interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export default function AddButton({
  className = "",
  ...props
}: AddButtonProps) {
  return (
    <div className="relative">
      <button
        aria-label="Add button"
        {...props}
        className={`add-button cursor-pointer rounded-lg bg-white px-15 py-5 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm active:scale-95 ${className || ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="white"
            stroke="#E5E5E5"
            strokeWidth="1"
          />
          <line
            x1="30"
            y1="50"
            x2="70"
            y2="50"
            stroke="#BDBDBD"
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="70"
            stroke="#BDBDBD"
            strokeWidth="3"
          />
        </svg>
      </button>
    </div>
  );
}
