"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Upload, Search, Camera, Moon, Sun } from "lucide-react";
import { useNotification } from "./Notification";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-black dark:text-white font-bold text-xl"
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search clips..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

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
                <ul className="dropdown-content menu p-2 shadow-lg bg-white dark:bg-gray-800 rounded-box w-52 mt-2 border border-gray-200 dark:border-gray-700">
                  <li className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    {session.user?.email?.split("@")[0]}
                  </li>
                  <li>
                    <Link
                      href="/upload"
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Create Clip</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2 text-red-600 w-full text-left"
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