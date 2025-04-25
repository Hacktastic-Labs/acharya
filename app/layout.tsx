"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { AptosWalletProvider } from "@/components/aptos-wallet-provider";
import { WorkspaceHeader } from "@/components/workspace-header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <AptosWalletProvider>
              <WorkspaceHeader />
              {children}
            </AptosWalletProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
