"use client";

import VideoUploadForm from "../components/VideoUploadForm";
import Header from "../components/Header";
import { Upload } from "lucide-react";

export default function VideoUploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen pt-24 pb-16 px-6">
        <div className="w-full max-w-md mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Upload Video
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Share your content with the world
            </p>
          </div>

          {/* Upload Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-8">
            <VideoUploadForm />
          </div>
        </div>
      </main>
    </div>
  );
}