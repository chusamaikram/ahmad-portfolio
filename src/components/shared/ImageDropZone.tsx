"use client";

import { useRef, useState, useCallback } from "react";

const MAX_SIZE_MB = 2;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
  value?: string;           // current preview (base64 or URL)
  onChange: (base64: string) => void;
  onClear: () => void;
  error?: string;
}

export default function ImageDropZone({ value, onChange, onClear, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const processFile = useCallback((file: File) => {
    setLocalError("");
    if (!ACCEPTED.includes(file.type)) {
      setLocalError("Only JPG, PNG, WEBP or GIF allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`Max file size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        Project Image <span className="normal-case font-normal text-gray-400">(optional)</span>
      </label>

      {value ? (
        /* Preview */
        <div className="relative rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 group">
          <img src={value} alt="Project preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => { onClear(); setLocalError(""); }}
              className="text-xs bg-red-500/70 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 py-8 px-4
            ${dragging
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : displayError
                ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 bg-gray-50 dark:bg-gray-900/40"
            }`}
        >
          <svg className={`w-8 h-8 ${dragging ? "text-violet-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <span className="text-violet-500 font-medium">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP, GIF — max {MAX_SIZE_MB}MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={onInputChange}
      />

      {displayError && (
        <p className="text-xs text-red-500 mt-0.5">{displayError}</p>
      )}
    </div>
  );
}
