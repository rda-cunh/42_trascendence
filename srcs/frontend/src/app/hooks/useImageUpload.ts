import { useRef, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

export interface ImageUploadResult {
  filename: string;
  url: string;
}

interface UseImageUploadOptions {
  onSuccess?: (result: ImageUploadResult) => void | Promise<void>;
  successMessage?: string;
  errorContext?: string;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    onSuccess,
    successMessage = "Image uploaded",
    errorContext = "image",
  } = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(`Please choose an ${errorContext} first`);
      return;
    }

    setIsUploading(true);

    try {
      const result = await api.uploadImage(selectedFile);
      const imageUrl = result.url ?? `/images/${result.filename}`;

      const uploadResult: ImageUploadResult = {
        filename: result.filename,
        url: imageUrl,
      };

      if (onSuccess) {
        await onSuccess(uploadResult);
      }

      setSelectedFile(null);
      toast.success(successMessage);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to upload ${errorContext}`;
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    isUploading,
    handleUpload,
  };
}
