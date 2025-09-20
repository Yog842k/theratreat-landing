import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// Use local fonts to avoid network fetch during build
const geistSans = localFont({
  src: "../assets/fonts/Inter.ttf",
  variable: "--font-geist-sans",
  weight: "400",
  style: "normal",
});

const geistMono = localFont({
  src: "../assets/fonts/Inter.ttf",
  variable: "--font-geist-mono",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "TheraTreat - Your Mental Health Companion",
  description: "Online Therapist booking platform for personalized mental health care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
