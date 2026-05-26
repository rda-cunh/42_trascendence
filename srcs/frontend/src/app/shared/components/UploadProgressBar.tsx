interface UploadProgressBarProps {
  progress: number;
  isUploading: boolean;
}

export function UploadProgressBar({ progress, isUploading }: UploadProgressBarProps) {
  if (!isUploading && progress === 0) return null;

  return (
    <div className="mt-2 w-full">
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-200"
          style={{ width: `${isUploading ? progress : 100}%` }}
        />
      </div>
      {isUploading && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Uploading… {progress}%</p>
      )}
    </div>
  );
}
