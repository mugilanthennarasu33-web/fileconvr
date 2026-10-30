import React from 'react';
import { Trash2, ArrowUp, ArrowDown, RotateCw, Plus } from 'lucide-react';
import type { UploadedFileItem } from '../types';
import { FileFormatIcon } from './FileFormatIcon';

interface FileListProps {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onRotate?: (id: string) => void;
  onAddMore?: () => void;
  allowRotation?: boolean;
}

import { formatFileSize } from '../utils/formatters';
export { formatFileSize };

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
        <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#64748B]">
          Selected Documents ({files.length})
        </h4>

        {onAddMore && (
          <button
            onClick={onAddMore}
            type="button"
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F7F9FF] hover:bg-slate-100 border border-[#E5EAF2] text-[#101828] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={2} />
            <span>Add More</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((item, index) => {
          let format = 'pdf';
          const lower = item.name.toLowerCase();
          if (lower.endsWith('.docx') || lower.endsWith('.doc')) format = 'word';
          else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) format = 'excel';
          else if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) format = 'ppt';
          else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) format = 'image';

          return (
            <div
              key={item.id}
              className="bg-white border border-[#E5EAF2] rounded-2xl p-4 flex flex-col justify-between group shadow-2xs hover:shadow-md hover:border-[#CBD5E1] transition-all"
            >
              {/* Top row with index and actions */}
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-full bg-[#F7F9FF] border border-[#E5EAF2] text-[#4F46E5] text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>

                <div className="flex items-center space-x-1">
                  {/* Move Up */}
                  {onMoveUp && index > 0 && (
                    <button
                      onClick={() => onMoveUp(index)}
                      title="Move earlier in order"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#101828] transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  )}

                  {/* Move Down */}
                  {onMoveDown && index < files.length - 1 && (
                    <button
                      onClick={() => onMoveDown(index)}
                      title="Move later in order"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#101828] transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  )}

                  {/* Rotate per file */}
                  {allowRotation && onRotate && (
                    <button
                      onClick={() => onRotate(item.id)}
                      title="Rotate 90° clockwise"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(item.id)}
                    title="Remove document"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-600 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Document Thumbnail / Icon */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div
                  className="relative transition-transform duration-300"
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                >
                  <FileFormatIcon format={format} size="lg" />
                  {item.rotation > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#2563EB] text-white text-[9px] font-extrabold px-1 rounded-full">
                      {item.rotation}°
                    </span>
                  )}
                </div>
              </div>

              {/* File info */}
              <div className="pt-2 border-t border-[#E5EAF2]">
                <p className="text-sm font-bold text-[#101828] truncate font-heading" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
