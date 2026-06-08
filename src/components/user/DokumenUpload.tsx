"use client";

import { formatFileSize } from "@/lib/utils";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useRef } from "react";

interface UploadedFile {
  file: File;
  name: string;
  size: number;
}

interface DokumenUploadProps {
  label: string;
  accept?: string;
  value?: UploadedFile;
  onChange: (file: UploadedFile | undefined) => void;
  error?: string;
}

const DokumenUpload = ({
  label,
  accept = "image/*,.pdf",
  value,
  onChange,
  error,
}: DokumenUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      onChange({ file, name: file.name, size: file.size });
      e.target.value = "";
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      onChange({ file, name: file.name, size: file.size });
    },
    [onChange],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <div className="w-full">
      <p className="mb-1.5 text-sm font-medium text-neutral-700">{label}</p>

      {value ? (
        <div className="flex items-center gap-3 rounded-btn border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FileText className="h-4 w-4 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-800">
              {value.name}
            </p>
            <p className="text-xs text-neutral-400">
              {formatFileSize(value.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-btn text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-danger"
            aria-label="Hapus file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-btn border-2 border-dashed px-4 py-6 text-center transition-colors",
            error
              ? "border-danger bg-red-50"
              : "border-neutral-300 bg-neutral-50 hover:border-primary-600 hover:bg-primary-50",
          ].join(" ")}
        >
          <UploadCloud
            className={[
              "h-7 w-7",
              error ? "text-danger" : "text-neutral-400",
            ].join(" ")}
          />
          <div>
            <p className="text-sm font-medium text-neutral-700">
              Klik atau seret file ke sini
            </p>
            <p className="text-xs text-neutral-400">
              PDF, JPG, PNG — maks 5 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default DokumenUpload;
