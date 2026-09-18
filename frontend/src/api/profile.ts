import { apiFetch } from "./client";
import type { MessageResponse } from "./types";

export interface ProfileData {
  user_id: string;
  image: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

interface UploadedImage {
  image_id: string;
  image_url: string;
}

export const getProfile = () => apiFetch<ProfileData>("/profile");

export const updateProfile = (payload: { name?: string; image?: string }) =>
  apiFetch<MessageResponse>("/profile", { method: "PATCH", body: JSON.stringify(payload) });

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("images", file);
  const images = await apiFetch<UploadedImage[]>("/profile/image", { method: "POST", body: formData });
  if (!images[0]?.image_url) throw new Error("อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
  await updateProfile({ image: images[0].image_url });
  return images[0].image_url;
}
