export default function CrossIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className="h-10 w-10"
      fill="none"
    >
      <line
        x1="30"
        y1="30"
        x2="70"
        y2="70"
        stroke="currentColor"
        className="text-ui-dark-stroke"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <line
        x1="70"
        y1="30"
        x2="30"
        y2="70"
        stroke="currentColor"
        className="text-ui-dark-stroke"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
