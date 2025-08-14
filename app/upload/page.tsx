"use client";

import VideoUploadForm from "../components/VideoUploadForm";
import { Upload } from "lucide-react";

export default function VideoUploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-red-50/80 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">      
      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen py-12 sm:py-16 px-4 sm:px-6 ml-20 md:ml-20">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-modern floating">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-crisp">
              Upload Video
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
              Share your content with the world
            </p>
          </div>

          {/* Upload Form */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-modern-lg border border-gray-200/30 dark:border-gray-800/30 p-6 sm:p-8 backdrop-blur-sm">
            <VideoUploadForm />
          </div>
        </div>
      </main>
    </div>
  );
}