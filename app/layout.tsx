'use client';

import "./globals.css";
import LenisProvider from "@/components/providers/lenis-provider";
import { UserProvider } from "@/components/providers/user-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </UserProvider>
      </body>
    </html>
  );
}
