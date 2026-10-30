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
  subtitle = 'Fast, secure & private document processing',
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
        className={`relative rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? 'border-red-500 bg-red-500/10 scale-[1.01] shadow-2xl shadow-red-500/10'
            : 'border-slate-800 hover:border-red-500/50 bg-slate-900/50 hover:bg-slate-900/80'
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

        {/* Upload Icon with Glowing Aura */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-400 p-0.5 shadow-xl shadow-red-500/25 mb-6 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <UploadCloud className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-heading">
          {title}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          {subtitle}
        </p>

        {/* Action Button */}
        <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200">
          <File className="w-4 h-4" />
          <span>Choose {multiple ? 'Files' : 'File'}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <span>Max file size: <strong className="text-slate-400">{maxSizeMB}MB</strong></span>
          <span>•</span>
          <span>Supported: <strong className="text-slate-400">{accept.replace(/\./g, ' ').toUpperCase()}</strong></span>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
