"use client";

import "./globals.css";
import { Providers } from "@/components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-sauti-50 via-white to-orange-50 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
