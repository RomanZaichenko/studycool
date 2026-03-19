"use client";

import { useState, useRef } from "react";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: {
    title: string;
    content: string;
    image: File | null;
  }) => void;
  initialTitle?: string;
  initialContent?: string;
}

export default function NoteEditor({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
  initialContent = "",
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex min-h-[600px] w-full max-w-4xl rounded-sm bg-[#f0f0f0] p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close note"
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-1 flex-col gap-4 pr-6">
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-transparent bg-white p-4 text-3xl font-bold text-gray-800 outline-none focus:border-gray-300"
          />

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-white p-6">
            <textarea
              placeholder="Start typing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-inter w-full flex-1 resize-none text-base text-gray-700 outline-none"
            />

            <div
              data-testid="image-placeholder"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-64 w-full cursor-pointer items-center justify-center overflow-hidden bg-[#d9d9d9] transition-colors hover:bg-gray-300"
            >
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage}
                  alt="Uploaded content"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-medium text-gray-500 opacity-0 transition-opacity hover:opacity-100">
                  Click to add image
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              data-testid="file-input"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="flex w-16 flex-col gap-3 pt-16">
          <div className="cursor-pointer rounded bg-white p-2 text-center text-xs text-gray-600 shadow-sm">
            14px
          </div>
          <div className="cursor-pointer rounded bg-white p-2 text-center text-xs text-gray-600 shadow-sm">
            Times
          </div>

          <div className="flex flex-wrap justify-center gap-2 rounded bg-white p-2 shadow-sm">
            <button className="h-5 w-5 font-bold hover:bg-gray-100">B</button>
            <button className="h-5 w-5 italic hover:bg-gray-100">I</button>
            <button className="h-5 w-5 underline hover:bg-gray-100">U</button>
            <button className="h-5 w-5 font-serif text-red-500 hover:bg-gray-100">
              A
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
