import { Panel } from "@xyflow/react";

interface MapToolbarProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onImportClick: () => void;
  onExportClick: () => void;
}

export function MapToolbar({
  undo,
  redo,
  canUndo,
  canRedo,
  onImportClick,
  onExportClick,
}: MapToolbarProps) {
  return (
    <Panel position="top-right" className="flex gap-3 p-4">
      <div className="mr-2 flex overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-30"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>
        <div className="w-px bg-gray-200"></div>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-30"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
            />
          </svg>
        </button>
      </div>

      <button
        onClick={onImportClick}
        className="rounded-sm bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        Import
      </button>
      <button
        onClick={onExportClick}
        className="rounded-sm bg-gray-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-700"
      >
        Export
      </button>
    </Panel>
  );
}
