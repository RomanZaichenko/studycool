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
    currentFontFamily 
  } = useNoteEditorLogic(initialTitle, initialContent, isOpen);

  if (!isOpen || !editor) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/10 backdrop-blur-sm p-4 font-sans">
      <div className="relative flex h-[92vh] w-full max-w-6xl bg-[#F0F0F0] p-8 shadow-2xl rounded-sm border border-gray-200">
        
        <button 
          onClick={() => { onSave({ title, content: editor.getHTML() }); onClose(); }}
          className="absolute top-6 right-8 text-gray-300 hover:text-gray-500 transition-colors z-10"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex w-full gap-8 overflow-hidden">
          
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white p-6 text-4xl font-bold outline-none shadow-sm placeholder:text-gray-300 text-gray-800 border-none focus:ring-0"
              placeholder="Note title"
            />

            <div 
              className="flex-1 bg-white overflow-y-auto shadow-sm border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 cursor-text"
              onClick={() => editor.chain().focus().run()}
            >
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="w-36 flex flex-col mt-12 gap-3 pt-2">
            
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
              options={["Inter", "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"]}
              onChange={(val) => editor.chain().focus().setFontFamily(val).run()}
            />

            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded shadow-sm border border-gray-100">
              <button 
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 text-sm font-bold hover:bg-gray-100 rounded flex justify-center text-gray-700 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
              >
                B
              </button>
              
              <button 
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 text-sm italic font-serif hover:bg-gray-100 rounded flex justify-center text-gray-700 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
              >
                I
              </button>
              
              <button 
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 text-sm underline hover:bg-gray-100 rounded flex justify-center text-gray-700 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
              >
                U
              </button>
              
              <label className="p-2 text-sm flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer relative">
                <span className="font-bold border-b-2 border-red-500 leading-none text-gray-700 uppercase">A</span>
                <input 
                  type="color" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onInput={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()} 
                />
              </label>

              <label className="p-2 text-sm flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer relative">
                <span className="bg-yellow-200 px-1 leading-none text-[10px] text-gray-800 font-bold uppercase">BG</span>
                <input 
                  type="color" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onInput={(e) => editor.chain().focus().toggleHighlight({ color: e.currentTarget.value }).run()} 
                />
              </label>
              
              <label className="p-2 text-sm flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer">
                🖼️
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            
            <button 
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className="mt-2 text-[10px] uppercase font-bold text-gray-400 hover:text-red-500 transition-colors"
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