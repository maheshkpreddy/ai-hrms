import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eh2r AI | An AI Product of MARQ AI",
  description: "eh2r AI - Comprehensive AI-powered HRMS by MARQ AI with intelligent talent acquisition, job portal, client management, recruitment workflow, and employee self-service.",
  keywords: ["eh2r AI", "MARQ AI", "HRMS", "AI", "Human Resources", "Talent Management", "Job Portal", "Client Portal", "Recruitment", "Next.js"],
  authors: [{ name: "MARQ AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "eh2r AI",
    description: "An AI Product of MARQ AI",
    url: "https://ai-hrms-rho.vercel.app",
    siteName: "eh2r AI by MARQ AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "eh2r AI",
    description: "An AI Product of MARQ AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
