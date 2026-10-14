import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ERICK DO CARMO ADVOGADOS | Advocacia em Praia Grande e Litoral de SP",
    template: "%s | ERICK DO CARMO ADVOGADOS",
  },
  description:
    "Advocacia estratégica e assessoria jurídica integral com atendimento em todo o Brasil. Defesa dos seus direitos com excelência, rigor técnico e soluções sob medida para você e sua empresa.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ERICK DO CARMO ADVOGADOS | Advocacia em Praia Grande e Litoral de SP",
    description:
      "Advocacia estratégica e assessoria jurídica integral com atendimento em todo o Brasil. Defesa dos seus direitos com excelência, rigor técnico e soluções sob medida para você e sua empresa.",
    url: SITE_URL,
    siteName: "ERICK DO CARMO ADVOGADOS",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/erick-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Erick do Carmo - ERICK DO CARMO ADVOGADOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ERICK DO CARMO ADVOGADOS | Advocacia em Praia Grande e Litoral de SP",
    description:
      "Advocacia estratégica e assessoria jurídica integral com atendimento em todo o Brasil. Soluções sob medida para você e sua empresa.",
    images: ["/erick-photo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Erick do Carmo Advogados",
    alternateName: "ERICK DO CARMO ADVOGADOS",
    identifier: "OAB/SP 465.833",
    description:
      "Advocacia estratégica e assessoria jurídica integral com atendimento em todo o Brasil. Atuação com rigor técnico, ética e soluções personalizadas para pessoas físicas e empresas.",
    url: SITE_URL,
    telephone: "+55-13-99789-4415",
    email: "adverickdocarmo@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Praia Grande",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    serviceType: [
      "Direito Imobiliário",
      "Direito Trabalhista",
      "Direito Cível",
      "Direito de Família e Sucessões",
      "Direito Empresarial",
      "Direito do Consumidor",
      "Direito Marítimo, Portuário e Aduaneiro",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      "https://www.instagram.com/erickdocarmo.adv/",
      "https://www.tiktok.com/@dr.erickdocarmo",
      "https://www.facebook.com/adv.erickdocarmo",
    ],
  };

  return (
    <html lang="pt-BR" className="scroll-smooth overflow-x-hidden">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${manrope.variable} font-sans antialiased overflow-x-hidden w-full max-w-[100vw]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
