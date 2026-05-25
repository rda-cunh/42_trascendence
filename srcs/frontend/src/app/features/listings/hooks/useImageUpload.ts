import { useRef, useState } from "react";
import { toast } from "sonner";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/app/shared/utils/constants";

export interface ImageUploadResult {
  filename: string;
  url: string;
}

interface UseImageUploadOptions {
  onSuccess?: (result: ImageUploadResult) => void | Promise<void>;
  successMessage?: string;
  errorContext?: string;
}

function validateImageFile(file: File, errorContext: string): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Invalid ${errorContext} type. Allowed: JPEG, PNG, WebP, GIF.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${errorContext} must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
  }
  return null;
}

function uploadWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<{ filename: string; url?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("image", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          filename: String(data.filename ?? ""),
          url: typeof data.url === "string" ? data.url : undefined,
        });
        return;
      }

      const detail =
        typeof data.detail === "string"
          ? data.detail
          : typeof data.error === "string"
            ? data.error
            : xhr.statusText || "Upload failed";
      reject(new Error(detail));
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", "/images/upload");
    const token = localStorage.getItem("auth_token");
    if (token && token !== "undefined" && token !== "null") {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { onSuccess, successMessage = "Image uploaded", errorContext = "image" } = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(`Please choose an ${errorContext} first`);
      return;
    }

    const validationError = validateImageFile(selectedFile, errorContext);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const result = await uploadWithProgress(selectedFile, setProgress);
      const imageUrl = result.url ?? `/images/${result.filename}`;

      const uploadResult: ImageUploadResult = {
        filename: result.filename,
        url: imageUrl,
      };

      if (onSuccess) {
        await onSuccess(uploadResult);
      }

      setSelectedFile(null);
      setProgress(100);
      toast.success(successMessage);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to upload ${errorContext}`;
      toast.error(message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 400);
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    isUploading,
    progress,
    handleUpload,
    fileInputRef,
  };
}
