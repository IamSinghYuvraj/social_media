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
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass backdrop-blur-modern shadow-lg' 
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    }`}>
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 group"
          onClick={() => showNotification("Welcome to Clipzy", "info")}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur"></div>
          </div>
          <span className="gradient-text font-bold text-2xl tracking-tight">Clipzy</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search amazing clips..."
              className="w-full pl-12 pr-6 py-3 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 backdrop-blur-sm"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search */}
          <button className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {session ? (
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Upload Button */}
              <Link
                href="/upload"
                className="relative group btn-modern px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => showNotification("Create your clip", "info")}
              >
                <div className="flex items-center space-x-2 text-white font-medium">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </div>
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </button>
                
                <div className="absolute right-0 top-12 w-64 glass rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {session.user?.email?.split("@")[0]}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link
                      href="/upload"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
                    >
                      <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Create Clip</span>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200 text-red-600 dark:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-modern px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
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