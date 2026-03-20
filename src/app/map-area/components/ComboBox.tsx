import { useState, useEffect } from "react";

interface ComboBoxProps {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (val: string) => void;
  autoSuffix?: string;
}

export function ComboBox({ value, placeholder, options, onChange, autoSuffix }: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => { setText(value || ""); }, [value]);

  const submit = (val: string) => {
    let finalVal = val.trim();
    if (autoSuffix && finalVal && !isNaN(Number(finalVal))) {
      finalVal += autoSuffix;
    }
    setText(finalVal);
    onChange(finalVal);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-gray-700">
      <div className={`flex border bg-white rounded shadow-sm transition-colors ${isOpen ? 'border-gray-400' : 'border-gray-100'}`}>
        <input
          type="text"
          className="w-full p-2 text-xs font-medium outline-none bg-transparent"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit(text);
            }
          }}
        />
        <button
          type="button"
          className="px-2 text-[10px] text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <ul className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded z-50 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          {options.map((opt) => (
            <li
              key={opt}
              className="p-2 text-xs cursor-pointer hover:bg-gray-100 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                submit(opt);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}