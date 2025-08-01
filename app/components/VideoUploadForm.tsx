"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useNotification } from "./Notification";
import { apiClient } from "@/lib/api-client";
import FileUpload from "./FileUpload";

interface VideoFormData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function VideoUploadForm() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<VideoFormData>({
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
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
      await apiClient.createVideo(data);
      showNotification("Video published successfully!", "success");

      // Reset form after successful submission
      reset();
      setUploadProgress(0);
      setUploadComplete(false);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Video Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Video</h3>
        
        <FileUpload
          fileType="video"
          onSuccess={handleUploadSuccess}
          onProgress={handleUploadProgress}
        />
        
        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploading... {uploadProgress}%
              </span>
              {uploadComplete && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Title Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          placeholder="Enter video title..."
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 ${
            errors.title 
              ? "border-red-500 focus:border-red-500" 
              : "border-gray-200 dark:border-gray-700 focus:border-purple-500"
          }`}
          {...register("title", { 
            required: "Title is required",
            minLength: { value: 3, message: "Title must be at least 3 characters" },
            maxLength: { value: 100, message: "Title must be less than 100 characters" }
          })}
        />
        {errors.title && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.title.message}</span>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Describe your video..."
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 resize-none ${
            errors.description 
              ? "border-red-500 focus:border-red-500" 
              : "border-gray-200 dark:border-gray-700 focus:border-purple-500"
          }`}
          {...register("description", { 
            required: "Description is required",
            minLength: { value: 10, message: "Description must be at least 10 characters" },
            maxLength: { value: 500, message: "Description must be less than 500 characters" }
          })}
        />
        {errors.description && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.description.message}</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !uploadComplete}
        className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
          loading || !uploadComplete
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Publishing...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Publish Video</span>
          </>
        )}
      </button>

      {!uploadComplete && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Please upload a video before publishing
        </p>
      )}
    </form>
  );
}