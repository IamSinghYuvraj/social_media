"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Home, Plus, Heart, User } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: pathname === "/"
    },
    {
      href: "/clips",
      icon: Home,
      label: "Clips",
      active: pathname === "/clips"
    },
    {
      href: "/upload",
      icon: Plus,
      label: "Create",
      active: pathname === "/upload"
    },
    {
      href: "/likes",
      icon: Heart,
      label: "Likes",
      active: pathname === "/likes"
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      active: pathname === "/profile"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label === "Profile" && profilePicture ? (
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
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}