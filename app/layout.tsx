import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./components/Providers";
import ConditionalLayout from "./components/ConditionalLayout";

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
        {/* Early theme bootstrap to avoid flash and ensure home page picks theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const saved = localStorage.getItem('theme'); const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; const enableDark = saved ? saved === 'dark' : prefersDark; document.documentElement.classList.toggle('dark', !!enableDark); } catch (e) {} })();`,
          }}
        />
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}