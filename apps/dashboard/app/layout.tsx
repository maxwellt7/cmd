import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMD — Command Center",
  description: "Unified personal command center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body className="min-h-screen bg-[#0a0a0a] text-zinc-50 antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
