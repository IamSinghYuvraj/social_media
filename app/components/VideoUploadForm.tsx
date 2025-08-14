"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, Upload, CheckCircle, AlertCircle} from "lucide-react";
import { useNotification } from "./Notification";
import { apiClient } from "@/lib/api-client";
import { ICaption } from "@/models/Video";
import FileUpload from "./FileUpload";

interface VideoFormData {
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  captions: ICaption[];
}

export default function VideoUploadForm() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [captions, setCaptions] = useState<ICaption[]>([]);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<VideoFormData>({
    defaultValues: {
      caption: "",
      videoUrl: "",
      thumbnailUrl: "",
      captions: [],
    },
  });

  const handleUploadSuccess = (response: IKUploadResponse) => {
    setValue("videoUrl", response.filePath);
    setValue("thumbnailUrl", response.thumbnailUrl || response.filePath);
    setUploadComplete(true);
    showNotification("Video uploaded successfully!", "success");
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const onSubmit = async (data: VideoFormData) => {
    if (!data.videoUrl) {
      showNotification("Please upload a video first", "error");
      return;
    }

    setLoading(true);
    try {
      await apiClient.createVideo({ ...data, captions });
      showNotification("Video published successfully!", "success");

      // Reset form after successful submission
      reset();
      setUploadProgress(0);
      setUploadComplete(false);
      setCaptions([]);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to publish video",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      {/* Video Upload Section */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-crisp">Upload Video</h3>
        
        <FileUpload
          fileType="video"
          onSuccess={handleUploadSuccess}
          onProgress={handleUploadProgress}
        />
        
        {uploadProgress > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploading... {uploadProgress}%
              </span>
              {uploadComplete && (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              )}
            </div>
            <div className="w-full bg-gray-200/80 dark:bg-gray-700/80 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Caption Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-crisp">
          Caption
        </label>
        <textarea
          rows={4}
          placeholder="Write a caption for your video..."
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 resize-none backdrop-blur-sm shadow-sm focus:shadow-modern ${
            errors.caption 
              ? "border-red-500 focus:border-red-500" 
              : "border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500"
          }`}
          {...register("caption", { 
            required: "Caption is required",
            minLength: { value: 3, message: "Caption must be at least 3 characters" },
            maxLength: { value: 2000, message: "Caption must be less than 2000 characters" }
          })}
        />
        {errors.caption && (
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-red-500 text-xs sm:text-sm">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{errors.caption.message}</span>
          </div>
        )}
      </div>


      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !uploadComplete}
        className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-modern ${
          loading || !uploadComplete
            ? "bg-gray-300/80 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-[1.02] hover:shadow-modern-lg"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Publishing...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Publish Video</span>
          </>
        )}
      </button>

      {!uploadComplete && (
        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Please upload a video before publishing
        </p>
      )}
    </form>
  );
}