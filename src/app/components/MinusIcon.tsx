export default function MinusIcon({ className = "w-6 h-6", strokeWidth = 2.5 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={`${className} block overflow-visible`}
    >
      {/* Одна лінія суворо по центру y=12 */}
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}