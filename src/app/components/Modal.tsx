"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CrossIcon from "./CrossIcon";

interface ModalProps {
  isVisible: boolean;
  closeWindow: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isVisible,
  closeWindow,
  title,
  children,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div
        className="fixed inset-0 bg-black opacity-20"
        onClick={closeWindow}
        onMouseDown={(e) => e.stopPropagation()}
      ></div>

      <div
        className="relative z-50 mt-[7vh] w-full max-w-150 overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="project-header flex justify-between rounded-t-lg border-b border-gray-100 bg-white p-3">
          <h5 className="font-inter text-ui-text-color pl-3 text-5xl font-bold">
            {title}
          </h5>
          <button
            onClick={closeWindow}
            className="cursor-pointer p-2 transition-opacity hover:opacity-70"
          >
            <CrossIcon />
          </button>
        </div>

        <div className="bg-gray-100 p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
