"use client";

import VideoUploadForm from "../components/VideoUploadForm";
import Header from "../components/Header";

export default function VideoUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="pt-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Clip</h1>
            <p className="text-gray-600">Share your moments with the Clipzy community</p>
          </div>
          <VideoUploadForm />
        </div>
      </main>
    </div>
  );
}