import { useEffect, useRef, useState } from "react";
import { adminUploadImage } from "../../api/admin";
import { resolveImageUrl } from "../../utils/image";
import { useToast } from "../../hooks/useToast";
import { fieldStyle, ghostBtn } from "./adminStyleTokens";

interface ImageUploaderProps {
  imageId: string;
  imageUrl?: string;
  onUploaded: (imageId: string, imageUrl?: string) => void;
}

export const ImageUploader = ({ imageId, imageUrl, onUploaded }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>();
  const { showToast } = useToast();

  const handleSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("รองรับเฉพาะไฟล์ JPEG, PNG และ WebP", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("รูปสินค้าต้องมีขนาดไม่เกิน 5 MB", "error");
      return;
    }
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const img = await adminUploadImage(file);
      onUploaded(img.image_id, img.image_url);
      setLocalPreview(undefined);
    } catch (err) {
	  setLocalPreview(undefined);
      showToast(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ", "error");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const preview = localPreview ?? (imageUrl ? resolveImageUrl(imageUrl) : undefined);

  return (
    <div style={{ marginBottom: 12 }}>
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            borderRadius: 14,
            border: "1px solid var(--line)",
            marginBottom: 12,
            display: "block",
          }}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => { void handleSelect(e.target.files?.[0]); e.target.value = ""; }}
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
