import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const metadata: Metadata = {
  title: "The Plug - AI DJ",
  description: "Emotion-aware music journeys powered by Gemini + YouTube Music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <Providers clientId={clientId}>{children}</Providers>
      </body>
    </html>
  );
}
