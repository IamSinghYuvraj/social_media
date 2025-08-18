"use client";

import { IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  onSuccess: (res: IKUploadResponse) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onError = (err: { message: string }) => {
    setError(err.message);
    setUploading(false);
  };

  const handleSuccess = (response: IKUploadResponse) => {
    setUploading(false);
    setError(null);
    onSuccess(response);
  };

  const handleStartUpload = () => {
    setUploading(true);
    setError(null);
  };

  const handleProgress = (evt: ProgressEvent) => {
    if (evt.lengthComputable && onProgress) {
      const percentComplete = (evt.loaded / evt.total) * 100;
      onProgress(Math.round(percentComplete));
    }
  };

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("Video size must be less than 100MB");
        return false;
      }
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <IKUpload
          fileName={fileType === "video" ? "video" : "image"}
          onError={onError}
          onSuccess={handleSuccess}
          onUploadStart={handleStartUpload}
          onUploadProgress={handleProgress}
          accept={fileType === "video" ? "video/*" : "image/*"}
          className="hidden"
          validateFile={validateFile}
          useUniqueFileName={true}
          folder={fileType === "video" ? "/videos" : "/images"}
          id={`upload-${fileType}`}
        />
        
        <label 
          htmlFor={`upload-${fileType}`}
          className={`w-full py-3 px-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 flex flex-col items-center space-y-2 ${
            uploading 
              ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600" 
              : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Uploading {fileType}...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload {fileType}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fileType === "video" ? "MP4, MOV, AVI up to 100MB" : "JPEG, PNG, WebP up to 5MB"}
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}