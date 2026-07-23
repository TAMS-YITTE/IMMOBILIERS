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

export const metadata: Metadata = {
  title: "Simulateur Achat vs Location | Immobilier",
  description: "Calculez précisément quand l'achat devient plus rentable que la location dans votre ville avec des données réelles.",
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
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
