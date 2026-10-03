import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueMate",
  description: "A modern solution to manage queues efficiently and keep everyone informed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FAFCFB] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
