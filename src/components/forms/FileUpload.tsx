"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  label?: string;
  helpText?: string;
}

const DEFAULT_ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
  "image/svg+xml": [".svg"],
  "application/postscript": [".ai", ".eps"],
};

export function FileUpload({
  onFilesChange,
  accept = DEFAULT_ACCEPT,
  label = "Drag & drop your artwork here",
  helpText = "Accepted formats: AI, EPS, SVG, PDF, PNG, JPG",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        setError("One or more files were rejected. Please check the accepted formats.");
      } else {
        setError(null);
      }
      const next = [...files, ...accepted];
      setFiles(next);
      onFilesChange?.(next);
    },
    [files, onFilesChange]
  );

  const removeFile = (name: string) => {
    const next = files.filter((f) => f.name !== name);
    setFiles(next);
    onFilesChange?.(next);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive ? "border-accent-600 bg-accent-50" : "border-primary-100 bg-surfaceMuted hover:border-accent-400"
        }`}
      >
        <input {...getInputProps()} aria-label="Upload artwork" />
        <UploadCloud className="mx-auto mb-3 text-accent-600" size={32} aria-hidden="true" />
        <p className="font-semibold text-primary-900">{label}</p>
        <p className="text-sm text-primary-400 mt-1">or click to browse — {helpText}</p>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-primary-50 bg-white px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-primary-900 truncate">
                <FileIcon size={16} className="text-accent-600 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                aria-label={`Remove ${file.name}`}
                className="text-primary-400 hover:text-red-600 shrink-0"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
