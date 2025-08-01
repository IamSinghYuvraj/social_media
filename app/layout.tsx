import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Clipzy - Share Your Moments",
  description: "A modern social media platform for sharing video clips",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}