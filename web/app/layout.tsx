import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const bodyFont = localFont({
  src: "../public/fonts/body.woff2",
  variable: "--font-body",
});

const degularDisplay = localFont({
  src: [
    {
      path: "../public/fonts/DegularDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/DegularDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/DegularDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-degular",
});

export const metadata: Metadata = {
  title: "RedByte - Simple network protection for everyone.",
  description:
    "Detect and respond to cyber attacks in real-time. Simple setup, powerful protection.",
  icons: {
    icon: "/favicon.ico",
    apple: "/redbyte-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${degularDisplay.variable}`}
    >
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="94d149aa-dd20-4d29-bfc1-bd1d7e4b2bde"
        ></script>
      </head>
      <body className="antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
