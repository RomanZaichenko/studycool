import React, { useState, useRef, useEffect } from "react";

interface ComboBoxProps {
  placeholder: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  autoSuffix?: string;
}

export function ComboBox({
  placeholder,
  value,
  options,
  onChange,
  autoSuffix = "",
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value ? value.replace(autoSuffix, "") : "");
  }, [value, autoSuffix]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const applyValue = () => {
    setIsOpen(false);
    if (!inputValue) return;
    const finalVal = inputValue.endsWith(autoSuffix)
      ? inputValue
      : inputValue + autoSuffix;
    onChange(finalVal);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="w-full rounded border border-gray-200 bg-white p-2 text-sm text-gray-700 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") applyValue();
        }}
        onBlur={() => {
          setTimeout(applyValue, 150);
        }}
      />
      {isOpen && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setInputValue(opt.replace(autoSuffix, ""));
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">
              Нічого не знайдено
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
