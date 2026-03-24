"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: "map" | "note";
}

export function ExportModal({ isOpen, onClose, exportType }: ExportModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  const [format, setFormat] = useState(exportType === "map" ? "png" : "md");

  useEffect(() => {
    setFormat(exportType === "map" ? "png" : "md");
  }, [exportType, isOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const mapFormats = [
    { id: "png", label: "PNG Image" },
    { id: "jpeg", label: "JPEG Image" },
    { id: "svg", label: "SVG Vector" },
    { id: "pdf", label: "PDF Document" },
  ];

  const noteFormats = [
    { id: "md", label: "Markdown" },
    { id: "txt", label: "Plain Text" },
    { id: "docx", label: "Word Document" },
    { id: "pdf", label: "PDF Document" },
  ];

  const currentFormats = exportType === "map" ? mapFormats : noteFormats;
  const title = exportType === "map" ? "Export Mind Map" : "Export Note";

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/10 p-4 font-sans backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-sm border border-gray-200 bg-[#F0F0F0] p-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 text-gray-300 transition-colors hover:text-gray-500"
          aria-label="Close export modal"
        >
          <svg
            className="h-10 w-10"
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

        <h2 className="mb-10 text-4xl font-bold text-gray-800">{title}</h2>

        <div className="mb-10 grid grid-cols-2 gap-4">
          {currentFormats.map((f) => (
            <div
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`flex cursor-pointer items-center gap-4 rounded-sm border bg-white p-5 shadow-sm transition-all ${
                format === f.id
                  ? "border-gray-800 ring-1 ring-gray-800"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-bold text-gray-700">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-sm border border-gray-200 bg-white px-8 py-4 text-sm font-bold tracking-wider text-gray-800 uppercase shadow-sm transition-colors hover:bg-gray-50"
          >
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
