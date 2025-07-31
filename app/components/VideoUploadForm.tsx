"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, Upload, CheckCircle, AlertCircle, Film, Type, FileText } from "lucide-react";
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
    watch,
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

  const watchedFields = watch();

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Video Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Your Video</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose a high-quality video file (max 100MB)</p>
          </div>
        </div>

        <div className="relative">
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
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add a Catchy Title</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Make it engaging and descriptive</p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Enter an amazing title for your clip..."
            className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 ${
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
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
            {watchedFields.title?.length || 0}/100
          </div>
        </div>
        
        {errors.title && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.title.message}</span>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Describe Your Clip</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tell viewers what makes this special</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            placeholder="Share the story behind your clip, add hashtags, or describe what viewers will see..."
            className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 resize-none ${
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
          <div className="absolute right-4 bottom-4 text-sm text-gray-400">
            {watchedFields.description?.length || 0}/500
          </div>
        </div>
        
        {errors.description && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.description.message}</span>
          </div>
        )}
      </div>

      {/* Hashtag Suggestions */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Trending Hashtags</h4>
        <div className="flex flex-wrap gap-2">
          {["#viral", "#trending", "#creative", "#amazing", "#fun", "#cool"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const currentDesc = watchedFields.description || "";
                if (!currentDesc.includes(tag)) {
                  setValue("description", `${currentDesc} ${tag}`.trim());
                }
              }}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 border border-purple-200 dark:border-purple-800"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !uploadComplete}
        className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
          loading || !uploadComplete
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Publishing Your Clip...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Publish Clip</span>
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