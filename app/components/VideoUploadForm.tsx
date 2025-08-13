"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, Upload, CheckCircle, AlertCircle, Plus, X } from "lucide-react";
import { useNotification } from "./Notification";
import { apiClient } from "@/lib/api-client";
import { ICaption } from "@/models/Video";
import FileUpload from "./FileUpload";

interface VideoFormData {
  title: string;
  description: string;
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
      title: "",
      description: "",
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

  const addCaption = () => {
    setCaptions([...captions, { text: "", startTime: 0, endTime: 0 }]);
  };

  const removeCaption = (index: number) => {
    setCaptions(captions.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, field: keyof ICaption, value: string | number) => {
    const updatedCaptions = captions.map((caption, i) =>
      i === index ? { ...caption, [field]: value } : caption
    );
    setCaptions(updatedCaptions);
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

      {/* Title Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-crisp">
          Title
        </label>
        <input
          type="text"
          placeholder="Enter video title..."
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 backdrop-blur-sm shadow-sm focus:shadow-modern ${
            errors.title 
              ? "border-red-500 focus:border-red-500" 
              : "border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500"
          }`}
          {...register("title", { 
            required: "Title is required",
            minLength: { value: 3, message: "Title must be at least 3 characters" },
            maxLength: { value: 100, message: "Title must be less than 100 characters" }
          })}
        />
        {errors.title && (
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-red-500 text-xs sm:text-sm">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{errors.title.message}</span>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-crisp">
          Description
        </label>
        <textarea
          rows={4}
          placeholder="Describe your video..."
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 transition-all duration-300 focus:outline-none focus:ring-0 resize-none backdrop-blur-sm shadow-sm focus:shadow-modern ${
            errors.description 
              ? "border-red-500 focus:border-red-500" 
              : "border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500"
          }`}
          {...register("description", { 
            required: "Description is required",
            minLength: { value: 10, message: "Description must be at least 10 characters" },
            maxLength: { value: 500, message: "Description must be less than 500 characters" }
          })}
        />
        {errors.description && (
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-red-500 text-xs sm:text-sm">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{errors.description.message}</span>
          </div>
        )}
      </div>

      {/* Captions Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-crisp">
            Captions (Optional)
          </label>
          <button
            type="button"
            onClick={addCaption}
            className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Caption</span>
          </button>
        </div>
        
        {captions.map((caption, index) => (
          <div key={index} className="bg-gray-50/80 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Caption {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeCaption(index)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Start Time (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={caption.startTime}
                  onChange={(e) => updateCaption(index, 'startTime', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-gray-700 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  End Time (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={caption.endTime}
                  onChange={(e) => updateCaption(index, 'endTime', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-gray-700 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Caption Text
              </label>
              <input
                type="text"
                value={caption.text}
                onChange={(e) => updateCaption(index, 'text', e.target.value)}
                placeholder="Enter caption text..."
                className="w-full px-2 py-1.5 bg-white dark:bg-gray-700 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ))}
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