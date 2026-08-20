import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/ui/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nourish Barista Latte Art Battle 2026",
  description:
    "Internal latte art competition platform — Nourish Group Indonesia × EXPAT Roastery",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#121212] text-[#FAEDCD] font-[family-name:var(--font-plus-jakarta)]">
        {children}
        <Footer />
      </body>
    </html>
  );
}
