"use client";

import { EditorContent } from "@tiptap/react";
import { createPortal } from "react-dom";
import { ComboBox } from "./ComboBox";
import { useNoteEditorLogic } from "../hooks/useNoteEditor";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string }) => void;
  initialTitle: string;
  initialContent: string;
}

export default function NoteEditor({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  initialContent,
}: NoteEditorProps) {
  const {
    editor,
    title,
    setTitle,
    handleImageUpload,
    currentFontSize,
    currentFontFamily,
  } = useNoteEditorLogic(initialTitle, initialContent, isOpen);

  if (!isOpen || !editor) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/10 p-4 font-sans backdrop-blur-sm">
      <div className="relative flex h-[92vh] w-full max-w-6xl rounded-sm border border-gray-200 bg-[#F0F0F0] p-8 shadow-2xl">
        <button
          aria-label="Close note"
          onClick={() => {
            onSave({ title, content: editor.getHTML() });
            onClose();
          }}
          className="absolute top-6 right-8 z-10 text-gray-300 transition-colors hover:text-gray-500"
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

        <div className="flex w-full gap-8 overflow-hidden">
          <div className="flex flex-1 flex-col gap-6 overflow-hidden">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-none bg-white p-6 text-4xl font-bold text-gray-800 shadow-sm outline-none placeholder:text-gray-300 focus:ring-0"
              placeholder="Note title"
            />

            <div
              className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 cursor-text overflow-y-auto border border-gray-100 bg-white shadow-sm"
              onClick={() => editor.chain().focus().run()}
            >
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="mt-12 flex w-36 flex-col gap-3 pt-2">
            <ComboBox
              placeholder="Size"
              value={currentFontSize}
              autoSuffix="px"
              options={["12px", "14px", "16px", "18px", "20px", "24px", "32px"]}
              onChange={(val) => editor.chain().focus().setFontSize(val).run()}
            />

            <ComboBox
              placeholder="Font Name"
              value={currentFontFamily}
              options={[
                "Inter",
                "Arial",
                "Times New Roman",
                "Courier New",
                "Georgia",
                "Verdana",
              ]}
              onChange={(val) =>
                editor.chain().focus().setFontFamily(val).run()
              }
            />

            <div className="grid grid-cols-3 gap-1 rounded border border-gray-100 bg-white p-1 shadow-sm">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`flex justify-center rounded p-2 text-sm font-bold text-gray-700 hover:bg-gray-100 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
              >
                B
              </button>

              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`flex justify-center rounded p-2 font-serif text-sm text-gray-700 italic hover:bg-gray-100 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
              >
                I
              </button>

              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`flex justify-center rounded p-2 text-sm text-gray-700 underline hover:bg-gray-100 ${editor.isActive("underline") ? "bg-gray-200" : ""}`}
              >
                U
              </button>

              <label className="relative flex cursor-pointer items-center justify-center rounded p-2 text-sm hover:bg-gray-100">
                <span className="border-b-2 border-red-500 leading-none font-bold text-gray-700 uppercase">
                  A
                </span>
                <input
                  type="color"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onInput={(e) =>
                    editor.chain().focus().setColor(e.currentTarget.value).run()
                  }
                />
              </label>

              <label className="relative flex cursor-pointer items-center justify-center rounded p-2 text-sm hover:bg-gray-100">
                <span className="bg-yellow-200 px-1 text-[10px] leading-none font-bold text-gray-800 uppercase">
                  BG
                </span>
                <input
                  type="color"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onInput={(e) =>
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: e.currentTarget.value })
                      .run()
                  }
                />
              </label>

              <label
                aria-label="Insert image"
                className="flex cursor-pointer items-center justify-center rounded p-2 text-sm hover:bg-gray-100"
              >
                🖼️
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <button
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className="mt-2 text-[10px] font-bold text-gray-400 uppercase transition-colors hover:text-red-500"
            >
              Clear formatting
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
