import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Scholarship Finder AI - Find Your Perfect Scholarship",
  description: "AI-powered scholarship matching platform. Get personalized recommendations, track applications, and achieve your educational dreams.",
  keywords: ["scholarship", "education", "AI", "matching", "university", "college", "funding"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
