import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Dr. Erick do Carmo | Advocacia & Consultoria Jurídica",
    template: "%s | Dr. Erick do Carmo Advogado",
  },
  description:
    "Advocacia estratégica e consultoria jurídica especializada em Direito Imobiliário e Direito Marítimo, Portuário e Aduaneiro. Atendimento em todo o Brasil.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Dr. Erick do Carmo | Advocacia & Consultoria Jurídica",
    description:
      "Segurança jurídica e firmeza na defesa dos seus interesses. Especialista Pós-graduado em Direito Imobiliário e Direito Marítimo, Portuário e Aduaneiro.",
    siteName: "Erick do Carmo Advogado",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
