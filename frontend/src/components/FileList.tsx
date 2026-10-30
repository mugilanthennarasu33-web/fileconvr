import React from 'react';
import { FileText, Trash2, ArrowUp, ArrowDown, RotateCw, Plus } from 'lucide-react';
import type { UploadedFileItem } from '../types';

interface FileListProps {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onRotate?: (id: string) => void;
  onAddMore?: () => void;
  allowRotation?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRotate,
  onAddMore,
  allowRotation = false,
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Selected Documents ({files.length})
        </h4>

        {onAddMore && (
          <button
            onClick={onAddMore}
            type="button"
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((item, index) => (
          <div
            key={item.id}
            className="glass-card relative rounded-2xl p-4 flex flex-col justify-between border border-slate-800 hover:border-slate-700 transition-all group"
          >
            {/* Top row with index and actions */}
            <div className="flex items-center justify-between mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>

              <div className="flex items-center space-x-1">
                {/* Move Up */}
                {onMoveUp && index > 0 && (
                  <button
                    onClick={() => onMoveUp(index)}
                    title="Move earlier in order"
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Move Down */}
                {onMoveDown && index < files.length - 1 && (
                  <button
                    onClick={() => onMoveDown(index)}
                    title="Move later in order"
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Rotate per file */}
                {allowRotation && onRotate && (
                  <button
                    onClick={() => onRotate(item.id)}
                    title="Rotate 90° clockwise"
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Remove */}
                <button
                  onClick={() => onRemove(item.id)}
                  title="Remove document"
                  className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Thumbnail / Icon */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div
                className="w-16 h-20 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-inner relative transition-transform duration-300"
                style={{ transform: `rotate(${item.rotation}deg)` }}
              >
                <FileText className="w-8 h-8 text-red-500/80 mb-1" />
                <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                  PDF
                </span>
                {item.rotation > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full">
                    {item.rotation}°
                  </span>
                )}
              </div>
            </div>

            {/* File info */}
            <div className="pt-2 border-t border-slate-800/60">
              <p className="text-sm font-semibold text-white truncate" title={item.name}>
                {item.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatFileSize(item.size)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
