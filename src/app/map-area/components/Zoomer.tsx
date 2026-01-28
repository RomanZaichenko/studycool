

export default function Zoomer() {

  const buttonStyles = `bg-white rounded-md border border-gray-300 w-12 h-12
    cursor-pointer`

  return (
    <div className="wrapper fixed bottom-10 right-10 flex flex-col gap-2">
      <button className={buttonStyles}>
        <svg  
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 8V16M8 12H16" 
            stroke="#BFBFBF" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </button>

      <button className={buttonStyles}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M8 12H16" 
            stroke="#BFBFBF" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </button>
    </div>
  )}