import type { Metadata } from "next";
import { Literata, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AudioProvider } from "@/components/AudioContext";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import { VisitTracker } from "@/components/VisitTracker";
import "./globals.css";

const literata = Literata({
  subsets: ["latin", "latin-ext"],
  variable: "--font-literata",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ay Işığı Kütüphanesi";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Gece çöktüğünde kelimeler fısıldar; mor ayın eşliğinde saklı hikâyeler açılır.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${literata.variable} ${sourceSans.variable}`} data-theme="light" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AudioProvider>
            <SiteBackdrop />
            <VisitTracker />
            {children}
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
