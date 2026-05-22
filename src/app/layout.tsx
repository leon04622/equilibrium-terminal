import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { RootProviders } from "@/components/providers/RootProviders";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Equilibrium Terminal",
  description: "Hyperliquid-native trading terminal — Equilibrium OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} ${geistSans.variable} font-mono tracking-tighter`}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
