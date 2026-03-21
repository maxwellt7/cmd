import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { isClerkConfigured } from "../lib/clerk";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMD — Command Center",
  description: "Unified personal command center",
};

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-[#0a0a0a] text-zinc-50 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isClerkConfigured) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <ClerkProvider appearance={{ baseTheme: dark }} signInUrl="/sign-in" signUpUrl="/sign-up">
      <AppShell>{children}</AppShell>
    </ClerkProvider>
  );
}
