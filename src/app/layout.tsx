import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { AudioProvider } from "@/hooks/useAudio";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ViewportHeightFix from "@/components/ViewportHeightFix";
import BottomNav from "@/components/BottomNav";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Chess Penguin",
  description: "Chess for kids — no reading needed!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chess Penguin",
  },
};

export const viewport: Viewport = {
  themeColor: "#B197FC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${nunitoSans.className} antialiased overflow-hidden`}
        style={{ background: "var(--ck-bg)" }}
      >
        <AuthProvider>
          <AudioProvider>
            {children}
            <BottomNav />
          </AudioProvider>
        </AuthProvider>
        <ServiceWorkerRegistrar />
        <ViewportHeightFix />
      </body>
    </html>
  );
}
