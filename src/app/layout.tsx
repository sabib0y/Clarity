import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarity PoC", // Updated title
  description: "ADHD Planning Tool PoC", // Updated description
  icons: { // Added icons configuration
    icon: [
      { url: '/favicons/favicon.ico', sizes: 'any' }, // Standard favicon
      { url: '/favicons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [ // Apple touch icon
      { url: '/favicons/apple-touch-icon.png', type: 'image/png' },
    ],
    // You can add other icons like android-chrome here if needed
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Defaulting lang to 'en'
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}> {/* Added font variables */}
      <body suppressHydrationWarning className="bg-white text-black dark:bg-gray-900 dark:text-gray-100">
        {/* Added dark mode background and text color */}
        {/* Removed PostHogProvider and DemoBadge wrappers */}
        {children}
      </body>
    </html>
  );
}
