// src/app/portal/admin/gallery/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  getGallery,
  updateGallery,
  addGalleryImage,
  removeGalleryImage,
} from "@/lib/firebase/gallery";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getCurrentTenant } from "@/lib/firebase/tenants";
import type { GalleryImage } from "@/types";

export default function AdminGalleryPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tenantId, setTenantId] = useState<string>("");

  // ─── AUTH GUARD ───

  useEffect(() => {
    if (authLoading) return;
    if (!profile || profile.access_role !== "admin") {
      router.replace("/portal/dashboard");
    }
  }, [authLoading, profile, router]);

  // ─── LOAD ───

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tenant = await getCurrentTenant();
      setTenantId(tenant.id);
      const data = await getGallery(tenant.id);
      setImages(data?.images || []);
    } catch (err) {
      console.error("Failed to load gallery:", err);
      setError("Unable to load gallery. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && profile?.access_role === "admin") {
      loadGallery();
    }
  }, [authLoading, profile, loadGallery]);

  // ─── UPLOAD ───

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const url = await uploadToCloudinary(file, "ifeanyi-2027/gallery");

      // Prompt for title
      const title = prompt("Enter a title for this image (optional):") || "";
      const description = prompt("Enter a description (optional):") || "";

      await addGalleryImage(tenantId, {
        url,
        title: title || "Gallery image",
        description: description || undefined,
      });

      await loadGallery();
      setSuccess("Image uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ─── DELETE ───

  const handleDelete = async (imageId: string) => {
    if (!confirm("Remove this image from the gallery?")) return;

    try {
      await removeGalleryImage(tenantId, imageId);
      await loadGallery();
      setSuccess("Image removed.");
    } catch (err) {
      console.error("Failed to remove image:", err);
      setError("Failed to remove image. Please try again.");
    }
  };

  // ─── LOADING ───

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-apc-primary" />
        <span className="ml-3 text-gray-500">Loading gallery...</span>
      </div>
    );
  }

  if (!profile || profile.access_role !== "admin") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Editor</h1>
          <p className="text-sm text-gray-500">
            Manage campaign photos. {images.length} images in gallery.
          </p>
        </div>
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-apc-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-apc-dark transition-colors disabled:opacity-50">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ─── NOTIFICATIONS ─── */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-500 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── GALLERY GRID ─── */}
      {images.length === 0 ? (
        <div className="rounded-2xl bg-white border-2 border-dashed border-gray-300 p-16 text-center">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No images uploaded yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Upload Image" to add photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm border"
            >
              <Image
                src={image.url}
                alt={image.title || "Gallery image"}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  aria-label="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {image.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-sm font-medium text-white truncate">
                      {image.title}
                    </p>
                    {image.description && (
                      <p className="text-xs text-white/80 truncate">
                        {image.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
