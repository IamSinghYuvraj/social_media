"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Upload, Search, Camera, Moon, Sun, Bell, Menu } from "lucide-react";
import { useNotification } from "./Notification";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass backdrop-blur-modern shadow-modern-lg border-b border-white/10 dark:border-gray-800/20' 
        : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-md'
    }`}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 sm:space-x-3 group"
          onClick={() => showNotification("Welcome to Clipzy", "info")}
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-modern group-hover:shadow-modern-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
          </div>
          <span className="gradient-text font-bold text-xl sm:text-2xl tracking-tight text-crisp">Clipzy</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 sm:mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search amazing clips..."
              className="w-full pl-9 sm:pl-12 pr-4 sm:pr-6 py-2.5 sm:py-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:bg-white/90 dark:focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm shadow-sm focus:shadow-modern"
            />
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Search */}
          <button className="md:hidden p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 backdrop-blur-sm">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-sm hover:shadow-modern"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            )}
          </button>

          {session ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 backdrop-blur-sm shadow-sm hover:shadow-modern">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
              </button>

              {/* Upload Button */}
              <Link
                href="/upload"
                className="relative group btn-modern px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-lg"
                onClick={() => showNotification("Create your clip", "info")}
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-white font-medium text-sm sm:text-base">
                  <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Create</span>
                </div>
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg sm:rounded-xl flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-modern hover:shadow-modern-lg hover:rotate-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                
                <div className="absolute right-0 top-10 sm:top-12 w-56 sm:w-64 glass rounded-xl sm:rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-white/10 dark:border-gray-700/20">
                  <div className="p-3 sm:p-4 border-b border-gray-200/10 dark:border-gray-700/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg sm:rounded-xl flex items-center justify-center shadow-modern">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white text-crisp">
                          {session.user?.email?.split("@")[0]}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link
                      href="/upload"
                      className="flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Create Clip</span>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-lg sm:rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm sm:text-base">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-modern px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-lg"
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