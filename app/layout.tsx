import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Library Desk",
  description: "Front desk for the Library Management System: members, catalog, and borrowing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-white`}>
        <Sidebar />
        <div className="md:pl-64">
          <main className="max-w-6xl mx-auto px-5 md:px-10 pb-24 pt-8 md:pt-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
