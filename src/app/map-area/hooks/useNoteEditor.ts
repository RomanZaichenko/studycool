import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extension-placeholder";
import { FontSize } from "../extensions/tiptap";
import { ChangeEvent, useEffect, useState } from "react";

export function useNoteEditorLogic(initialTitle: string, initialContent: string, isOpen: boolean) {
  const [title, setTitle] = useState(initialTitle);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      // @ts-expect-error: ImageResize issue
      ImageResize.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: "Start typing your note..." }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose focus:outline-none min-h-full max-w-none p-12 bg-white text-gray-800",
      },
    },
  });

  // Синхронізація контенту при зміні нотатки
  useEffect(() => {
    if (isOpen && editor) {
      editor.commands.setContent(initialContent);
      setTitle(initialTitle);
    }
  }, [isOpen, initialContent, initialTitle, editor]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          editor.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentFontSize = editor?.getAttributes("textStyle").fontSize || "16px";
  const currentFontFamily = editor?.getAttributes("textStyle").fontFamily || "Inter";

  return {
    editor,
    title,
    setTitle,
    handleImageUpload,
    currentFontSize,
    currentFontFamily,
  };
}