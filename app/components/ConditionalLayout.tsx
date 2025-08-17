"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { data: session, status } = useSession();

  // Show loading state while checking authentication
  if (status === "loading") {
    return <>{children}</>;
  }

  // If user is not authenticated, render children without sidebar layout
  if (!session) {
    return <>{children}</>;
  }

  // If user is authenticated, render with sidebar layout
  return (
    <>
      <Sidebar />
      <main className="md:ml-20 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
    </>
  );
}
