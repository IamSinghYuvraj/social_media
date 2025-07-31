"use client";

import VideoUploadForm from "../components/VideoUploadForm";
import Header from "../components/Header";
import { Upload, Sparkles, Zap, Heart } from "lucide-react";

export default function VideoUploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl floating">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Create Your Next
              <span className="gradient-text block">Viral Clip</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Share your creativity with the world. Upload, customize, and watch your content come to life.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Upload and process your videos in seconds with our optimized pipeline.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Enhanced</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Automatic optimization and enhancement for maximum engagement.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Love</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Connect with millions of viewers who appreciate great content.</p>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm p-8 md:p-12">
            <VideoUploadForm />
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 border border-purple-200/50 dark:border-purple-800/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Pro Tips for Viral Content
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Hook in First 3 Seconds</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Grab attention immediately with compelling visuals or intriguing questions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Optimize for Mobile</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Vertical format works best for mobile viewing and engagement.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Use Trending Hashtags</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Research and include relevant trending hashtags to boost discoverability.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Consistent Posting</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Regular uploads help build audience and improve algorithm performance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}