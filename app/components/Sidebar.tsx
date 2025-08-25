"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { 
  Home, 
  PlusSquare, 
  User, 
  Menu, 
  LogOut,
  Camera,
  Moon,
  Sun,
  X
} from "lucide-react";
import { useNotification } from "./Notification";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  // Fetch user profile picture for avatar usage
  useEffect(() => {
    if (!session?.user) return;
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setProfilePicture(data?.profilePicture ?? null);
      } catch {
        // no-op
      }
    })();
    return () => { isMounted = false; };
  }, [session?.user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  const navigationItems = [
    {
      name: "Videos",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },

    {
      name: "Create",
      href: "/upload",
      icon: PlusSquare,
      isActive: pathname === "/upload",
    },

    {
      name: "Profile",
      href: "/profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  if (!session) {
    return null; // Don't show sidebar if not authenticated
  }

  return (
    <>
      {/* Mobile Hamburger (top-left) */}
      <button
        aria-label="Open menu"
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 ${
        isExpanded ? 'w-64' : 'w-20'
      } hidden md:flex flex-col`}>
        
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-4 h-4 text-white" />
            </div>
            {isExpanded && (
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Clipzy
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      item.isActive
                        ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    {/* If Profile item and we have avatar, show it */}
                    {item.name === "Profile" && profilePicture ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                        <Image
                          src={profilePicture}
                          alt="Profile avatar"
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <Icon className={`w-6 h-6 ${item.isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                    )}
                    {isExpanded && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                    {item.isActive && !isExpanded && (
                      <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className="space-y-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              {isExpanded && (
                <span className="ml-3 font-medium text-sm">
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </button>

            {/* Toggle Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
              {isExpanded && (
                <span className="ml-3 font-medium text-sm">Collapse</span>
              )}
            </button>

            {/* User Info */}
            {isExpanded && (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                    {profilePicture ? (
                      <Image
                        src={profilePicture}
                        alt="Profile avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Compact Sign Out */}
            {!isExpanded && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                title="Sign Out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      {/* Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-[61] w-64 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Clipzy
            </span>
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isProfile = item.name === 'Profile';
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      item.isActive
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {isProfile && profilePicture ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={profilePicture}
                          alt="Profile avatar"
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mirror desktop controls: theme toggle + user info + sign out */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            <span className="ml-3 font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt="Profile avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
