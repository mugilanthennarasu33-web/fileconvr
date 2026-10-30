import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  multiple = false,
  maxSizeMB = 100,
  onFilesSelected,
  title = 'Select or drop files here',
  subtitle,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check file size
      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" exceeds the maximum limit of ${maxSizeMB}MB.`);
        return;
      }

      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? 'border-[#4F46E5] bg-[#F7F9FF] scale-[1.01] shadow-xl'
            : 'border-[#E5EAF2] hover:border-[#4F46E5] bg-[#F7F9FF]/60 hover:bg-[#F7F9FF] shadow-2xs hover:shadow-md'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Upload Cloud Icon in squircle */}
        <div className="mx-auto flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-indigo-50 to-indigo-100/70 border border-indigo-200/90 shadow-[0_2px_8px_rgba(99,102,241,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-[#4F46E5]" strokeWidth={2} />
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#101828] mb-2 font-heading">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[#64748B] mb-2 font-normal">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-[#94A3B8] mb-4 font-medium">or</p>

        {/* Action Button */}
        <div>
          <div className="btn-primary inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-all duration-200">
            <File className="w-4 h-4" strokeWidth={2} />
            <span>Choose {multiple ? 'Files' : 'File'}</span>
          </div>
        </div>

        <div className="mt-5 text-xs text-[#64748B]">
          Max file size: <strong className="font-semibold text-[#101828]">{maxSizeMB} MB</strong> • Supports <strong className="font-semibold text-[#101828]">{accept.replace(/\./g, ' ').toUpperCase().trim()}</strong>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
