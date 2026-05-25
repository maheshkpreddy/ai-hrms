import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "eh2r AI | An AI Product of MARQ AI",
  description: "eh2r AI - Comprehensive AI-powered HRMS by MARQ AI with intelligent talent acquisition, job portal, client management, recruitment workflow, and employee self-service.",
  keywords: ["eh2r AI", "MARQ AI", "HRMS", "AI", "Human Resources", "Talent Management", "Job Portal", "Client Portal", "Recruitment", "Next.js"],
  authors: [{ name: "MARQ AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "eh2r AI",
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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
