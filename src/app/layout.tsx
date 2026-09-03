import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ERICK DO CARMO ADVOGADOS | Assessoria Jurídica",
    template: "%s | ERICK DO CARMO ADVOGADOS",
  },
  description:
    "Advocacia multidisciplinar e assessoria jurídica estratégica em Direito Imobiliário, Trabalhista, Cível, Família e Empresas. Atendimento em todo o Brasil.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ERICK DO CARMO ADVOGADOS | Assessoria Jurídica",
    description:
      "Segurança jurídica e firmeza na defesa dos seus interesses. Advocacia estratégica e assessoria jurídica em todo o Brasil.",
    siteName: "ERICK DO CARMO ADVOGADOS",
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
