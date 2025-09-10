import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XAMXAM - Plateforme de Commerce Conversationnel",
  description: "XAMXAM - La plateforme tout-en-un pour gérer vos conversations clients et développer votre commerce via WhatsApp et autres canaux de messagerie.",
  keywords: "commerce conversationnel, WhatsApp Business, gestion client, messagerie, e-commerce",
  authors: [{ name: "XAMXAM Team" }],
  creator: "XAMXAM",
  publisher: "XAMXAM",
  metadataBase: new URL("https://xamxam.io"),
  openGraph: {
    title: "XAMXAM - Plateforme de Commerce Conversationnel",
    description: "La plateforme tout-en-un pour gérer vos conversations clients et développer votre commerce via WhatsApp et autres canaux de messagerie.",
    url: "https://xamxam.io",
    siteName: "XAMXAM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XAMXAM - Plateforme de Commerce Conversationnel",
    description: "La plateforme tout-en-un pour gérer vos conversations clients et développer votre commerce via WhatsApp et autres canaux de messagerie.",
    creator: "@xamxam_io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
