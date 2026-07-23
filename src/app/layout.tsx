import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pilote de refonte visuelle (page d'accueil uniquement pour l'instant, cf. .font-jakarta
// dans globals.css) : chargee ici globalement car next/font l'exige, mais volontairement
// pas appliquee au body pour ne pas changer la police du reste du site avant validation.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kalcul.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Kalcul.app | Simulateur Achat vs Location Immobilier",
    template: "%s | Kalcul.app"
  },
  description: "Calculez précisément quand l'achat immobilier devient plus rentable que la location dans votre ville avec des données ouvertes de l'État.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: baseUrl,
    title: "Kalcul.app | Intelligence Immobilière",
    description: "La première plateforme d'intelligence immobilière pour les particuliers. Simulez, comparez et investissez en toute transparence.",
    siteName: "Kalcul.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalcul.app | Intelligence Immobilière",
    description: "La première plateforme d'intelligence immobilière pour les particuliers. Simulez et comparez.",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
