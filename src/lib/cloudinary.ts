/**
 * Cloudinary Upload Utility for Ifeanyi 2027 Campaign Application
 *
 * Folder structure conventions:
 * - News: "ifeanyi-2027/news"
 * - Gallery: "ifeanyi-2027/gallery"
 * - Candidate: "ifeanyi-2027/candidate"
 * - Campaign Members: "ifeanyi-2027/campaign-members"
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dvvwuktq";

export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ifeanyichukwu-2027";

export type CloudinaryFolder =
  | "ifeanyi-2027/news"
  | "ifeanyi-2027/gallery"
  | "ifeanyi-2027/candidate"
  | "ifeanyi-2027/campaign-members";

export async function uploadToCloudinary(
  file: File,
  folder: CloudinaryFolder = "ifeanyi-2027/news"
): Promise<string> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP images are allowed.");
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Cloudinary upload failed with status ${response.status}`
    );
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error("Cloudinary upload succeeded but no URL was returned.");
  }

  return data.secure_url;
}
