"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Upload, Search, Camera } from "lucide-react";
import { useNotification } from "./Notification";

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-black font-bold text-xl"
          onClick={() => showNotification("Welcome to Clipzy", "info")}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text font-bold">Clipzy</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clips..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {session ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/upload"
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                onClick={() => showNotification("Create your clip", "info")}
              >
                <Upload className="w-5 h-5 text-white" />
              </Link>
              
              <div className="dropdown dropdown-end">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center cursor-pointer">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ul className="dropdown-content menu p-2 shadow-lg bg-white rounded-box w-52 mt-2 border border-gray-200">
                  <li className="px-3 py-2 text-sm text-gray-600 border-b">
                    {session.user?.email?.split("@")[0]}
                  </li>
                  <li>
                    <Link
                      href="/upload"
                      className="px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Create Clip</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2 text-red-600 w-full text-left"
                    >
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              onClick={() => showNotification("Please sign in to continue", "info")}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}