import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "RajatBuilds — Performance Arena",
  description: "A real API load testing tool. Fire concurrent requests. Expose bottlenecks. Prove performance. Built by Rajat.",
  keywords: ["API load testing", "performance testing", "backend engineering", "latency", "throughput"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="relative z-10">{children}</body>
    </html>
  );
}
