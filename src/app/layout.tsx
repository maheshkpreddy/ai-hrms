import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ApiProvider } from "@/lib/api-provider";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eh2r AI - AI-Powered HR Platform",
  description: "An AI Product of MARQ AI - Enterprise Multi-Company AI-Driven Human Resource Management System with intelligent workflows, predictive analytics, and comprehensive HR automation.",
  keywords: ["HRMS", "HR", "Enterprise", "AI", "Human Resources", "Payroll", "Recruitment", "eh2r"],
  authors: [{ name: "MARQ AI" }],
  openGraph: {
    title: "eh2r AI",
    description: "AI-Powered Human Resource Management System - An AI Product of MARQ AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider defaultTheme="dark">
          <Providers>
            <ApiProvider>
              {children}
            </ApiProvider>
          </Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
