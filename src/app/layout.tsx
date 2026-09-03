import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crm-erick.vercel.app"),
  title: {
    default: "ERICK DO CARMO ADVOGADOS | Assessoria Jurídica",
    template: "%s | ERICK DO CARMO ADVOGADOS",
  },
  description:
    "Atuação jurídica conduzida por advogado especialista, com foco em soluções legais pautadas no rigor técnico, na análise minuciosa de riscos e na absoluta transparência. Atendimento em todo o Brasil.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ERICK DO CARMO ADVOGADOS | Assessoria Jurídica",
    description:
      "Atuação jurídica conduzida por advogado especialista, com foco em soluções legais pautadas no rigor técnico, na análise minuciosa de riscos e na absoluta transparência.",
    url: "https://crm-erick.vercel.app",
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
    title: "ERICK DO CARMO ADVOGADOS | Assessoria Jurídica",
    description:
      "Atuação jurídica conduzida por advogado especialista, com foco em soluções legais pautadas no rigor técnico e absoluta transparência.",
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
    description:
      "Advocacia estratégica e assessoria jurídica multidisciplinar em Praia Grande - SP. Atendimento em todo o Brasil nas áreas de Direito Imobiliário, Trabalhista, Cível, Família e Sucessões, Empresarial e Marítimo.",
    url: "https://crm-erick.vercel.app",
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
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
