import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenGuild - Where Builders Become Legends",
  description: "Join 10,000+ developers, designers, and founders forming verified teams, shipping real products, and earning reputation that opens doors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

