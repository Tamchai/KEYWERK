import { useRef, useState } from "react";
import { adminUploadImage } from "../../api/admin";
import { resolveImageUrl } from "../../utils/image";
import { fieldStyle, ghostBtn } from "./adminStyles";

interface ImageUploaderProps {
  imageId: string;
  imageUrl?: string;
  onUploaded: (imageId: string, imageUrl?: string) => void;
}

export const ImageUploader = ({ imageId, imageUrl, onUploaded }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const img = await adminUploadImage(file);
      onUploaded(img.image_id, img.image_url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  const preview = imageUrl ? resolveImageUrl(imageUrl) : undefined;

  return (
    <div style={{ marginBottom: 12 }}>
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            width: 72,
            height: 72,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid var(--line)",
            marginBottom: 8,
            display: "block",
          }}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />
      <button
        type="button"
        style={{ ...fieldStyle, ...ghostBtn, marginBottom: 0, width: "auto" }}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "กำลังอัปโหลด..." : preview ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
      </button>
      <input type="hidden" value={imageId} />
    </div>
  );
};
