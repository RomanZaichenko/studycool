"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleImport = () => {
    if (!text.trim()) return;
    onImport(text);
    setText("");
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result;
      if (typeof fileContent === "string") {
        setText(fileContent);
      }
    };

    reader.readAsText(file);

    e.target.value = "";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#111111]/80 p-4 font-sans backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-md bg-[#f0f0f0] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-6 text-3xl font-bold text-[#333333]">Import Data</h2>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Paste your structured text or upload a file.
          </p>

          <label className="flex cursor-pointer items-center gap-2 rounded bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload File
            <input
              type="file"
              accept=".txt,.json,.md,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="- Main Idea&#10;  - Sub idea 1&#10;  - Sub idea 2"
          className="h-64 w-full resize-none rounded-sm border-none bg-white p-4 text-sm text-gray-800 shadow-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded bg-white px-6 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!text.trim()}
            className="bg-primary-color hover:bg-primary-hover rounded px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50"
          >
            Import
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
