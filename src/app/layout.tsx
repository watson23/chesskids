import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { AudioProvider } from "@/hooks/useAudio";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ViewportHeightFix from "@/components/ViewportHeightFix";
import HtmlLangSync from "@/components/HtmlLangSync";
import ErrorBoundary from "@/components/ErrorBoundary";


const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Piku Chess — My First Chess Moves",
  description: "Learn chess from the very first move — for kids ages 3–6!",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Piku Chess",
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
      <head />
      <body
        className={`${nunitoSans.className} antialiased overflow-hidden`}
        style={{ background: "var(--ck-bg)" }}
      >
        <ErrorBoundary>
          <AuthProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </AuthProvider>
        </ErrorBoundary>
        <ServiceWorkerRegistrar />
        <ViewportHeightFix />
        <HtmlLangSync />
      </body>
    </html>
  );
}
