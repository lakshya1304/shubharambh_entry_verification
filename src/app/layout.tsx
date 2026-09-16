import type { Metadata } from "next";
import "./globals.css";
import { SplashVerification } from "@/components/SplashVerification";

export const metadata: Metadata = {
  title: "Shubharambh 2.0 | Freshers Party",
  description: "Event entry management system for Shubharambh 2.0 by ICFAI Tech Department",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SplashVerification>
          {children}
        </SplashVerification>
      </body>
    </html>
  );
}
