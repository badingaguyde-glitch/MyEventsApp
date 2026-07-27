import type { Metadata } from "next";
import { Geist, Geist_Mono , Outfit} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BANTU MY EVENT | Plateforme d'expérience évènementielle tout-en-un",
  description: "Organisez, vendez des billets, gérez vos participants et validez les accès via QRCode de manière sécurisée et efficace avec BANTU MY EVENT, la plateforme d'expérience évènementielle tout-en-un.",
  keywords: "billeterie, évènements, QR code, Mobile Money, BANTU, organisation d'évènements, gestion de participants, validation d'accès, plateforme tout-en-un",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable}`}
    >
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 z-10 relative">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
