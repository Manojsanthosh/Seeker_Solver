import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X } from 'lucide-react';
import { UploadedFile } from '../../types';
import { cn, formatFileSize, generateId } from '../../lib/utils';

export interface FileUploadProps {
  label?: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
  helperText?: string;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  files,
  onChange,
  maxFiles = 5,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  helperText = 'PDF, DOC, PNG, or JPG up to 10MB each',
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = [];
    const availableSlots = maxFiles - files.length;
    const toTake = Math.min(fileList.length, availableSlots);

    for (let i = 0; i < toTake; i++) {
      const file = fileList[i];
      newFiles.push({
        id: `file_${generateId()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }

    if (newFiles.length > 0) {
      onChange([...files, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50',
          isDragging
            ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-indigo-400',
          error && 'border-rose-400 bg-rose-50/20'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
          </div>
        </div>
      </div>

      {/* File Chips */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-slate-600">
            Uploaded Files ({files.length}/{maxFiles}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file) => {
              const isImage = file.type.startsWith('image/');
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      {isImage ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-rose-500 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
