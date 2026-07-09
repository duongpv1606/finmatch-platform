"use client";

import { useRef, useState } from "react";

export function ImageUploadField({
  label,
  value,
  onUploaded,
  upload,
}: {
  label: string;
  value?: string;
  onUploaded: (url: string) => void;
  upload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file)); // instant local preview while uploading
    setUploading(true);
    try {
      const url = await upload(file);
      onUploaded(url);
      setPreview(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="calc-input-group">
      <label className="calc-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            border: "1.5px dashed var(--gray-300)",
            background: "var(--gray-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <i className="ti ti-photo-plus" style={{ fontSize: 20, color: "var(--gray-400)" }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--blue)",
              background: "var(--blue-light)",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            {uploading ? "Đang tải lên..." : preview ? "Đổi ảnh" : "Chọn ảnh"}
          </button>
          {error && <div style={{ color: "#DC2626", fontSize: 11, marginTop: 6 }}>{error}</div>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
