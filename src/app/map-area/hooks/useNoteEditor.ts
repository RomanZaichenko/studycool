import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { FontSize } from "../extensions/tiptap";
import { ChangeEvent, useEffect, useState } from "react";

const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "decimal",
        parseHTML: (element) => element.style.listStyleType || "decimal",
        renderHTML: (attributes) => {
          return { style: `list-style-type: ${attributes.listStyleType}` };
        },
      },
    };
  },
});

const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "disc",
        parseHTML: (element) => element.style.listStyleType || "disc",
        renderHTML: (attributes) => {
          return { style: `list-style-type: ${attributes.listStyleType}` };
        },
      },
    };
  },
});

export function useNoteEditorLogic(
  initialTitle: string,
  initialContent: string,
  isOpen: boolean
) {
  const [title, setTitle] = useState(initialTitle);
  const [isOpenExport, setIsOpenExport] = useState<boolean>(false);
  const [, setForceUpdate] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      CustomBulletList,
      CustomOrderedList,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
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
        class:
          "prose focus:outline-none min-h-full max-w-none p-12 bg-white text-gray-800",
      },
    },
    onTransaction: () => {
      setForceUpdate({});
    },
    onSelectionUpdate: () => {
      setForceUpdate({});
    },
  });

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
  const currentFontFamily =
    editor?.getAttributes("textStyle").fontFamily || "Inter";

  return {
    editor,
    title,
    setTitle,
    handleImageUpload,
    currentFontSize,
    currentFontFamily,
    isOpenExport,
    setIsOpenExport,
  };
}
