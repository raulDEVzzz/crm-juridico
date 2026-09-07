import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { MobileNav } from "@/components/ui/mobile-nav";
import { EmailButton } from "@/components/ui/email-button";
import {
  Anchor,
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock,
  Facebook,
  Instagram,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Scale,
  Shield,
  Users2,
  Youtube,
} from "lucide-react";

const whatsappUrl =
  "https://api.whatsapp.com/message/DO2RHGYHLCLVH1?autoload=1&app_absent=0";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/erickdocarmo.adv/",
    icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@dr.erickdocarmo",
    icon: Music2,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCbd3w-FoIM_pmtCuuvw5sGA",
    icon: Youtube,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/adv.erickdocarmo",
    icon: Facebook,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070D1B] text-slate-100 selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070D1B]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0" aria-label="Erick do Carmo Advogados">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow-sm">
              <Image src="/logo.jpg" alt="Logo EC" width={40} height={40} className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs sm:text-base font-semibold uppercase tracking-tight text-white leading-tight truncate sm:overflow-visible">
                ERICK DO CARMO ADVOGADOS
              </span>
              <span className="block text-[9px] sm:text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Assessoria Jurídica
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <Link href="#atuacao" className="transition-colors hover:text-white">
              Áreas de Atuação
            </Link>
            <Link href="#escritorio" className="transition-colors hover:text-white">
              O Escritório
            </Link>
            <Link href="#faq" className="transition-colors hover:text-white">
              Dúvidas
            </Link>
            <Link href="#contato" className="transition-colors hover:text-white">
              Contato
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-500 sm:inline-flex md:inline-flex"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Agendar Consulta
            </a>
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white md:inline-flex"
            >
              <Lock className="h-3 w-3 text-slate-400" />
              Área Restrita
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-800/80 bg-gradient-to-b from-[#070D1B] via-[#0B152B] to-[#070D1B] py-8 sm:py-12 lg:py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12">
            <FadeIn className="max-w-2xl lg:col-span-7">
              <p className="mb-3 sm:mb-4 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-950/60 px-3 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-blue-300">
                Assessoria Jurídica de Excelência
              </p>
              <h1 className="text-2xl font-semibold leading-[1.18] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Segurança jurídica e firmeza na defesa dos seus interesses.
              </h1>
              <p className="mt-4 sm:mt-5 text-sm sm:text-base font-normal leading-relaxed text-slate-300 sm:text-lg">
                Atuação jurídica conduzida por advogado especialista, com foco em soluções legais pautadas no rigor técnico, na análise minuciosa de riscos e na absoluta transparência.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-950/50 transition-colors hover:bg-blue-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  Agendar Consulta
                </a>
                <Link
                  href="#atuacao"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-6 py-3.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  Conhecer áreas de atuação
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={150} className="relative mx-auto w-full max-w-[320px] sm:max-w-[400px] lg:col-span-5 lg:ml-auto">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-slate-800/80">
                <Image 
                  src="/erick-photo.jpg" 
                  alt="Dr. Erick do Carmo" 
                  fill 
                  className="object-cover object-top" 
                  priority 
                  quality={95}
                  sizes="(min-width: 1024px) 40vw, 100vw" 
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Faixa de Métricas de Autoridade */}
        <section className="border-b border-slate-800/80 bg-[#050914] py-8 sm:py-10 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <FadeIn direction="up">
              <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4 md:divide-x md:divide-slate-800/80">
                <div className="rounded-lg bg-[#091124]/40 p-3 sm:bg-transparent sm:p-0 text-center md:text-left md:pr-6">
                  <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">+300</p>
                  <p className="mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                    Clientes Atendidos
                  </p>
                </div>
                <div className="rounded-lg bg-[#091124]/40 p-3 sm:bg-transparent sm:p-0 text-center md:text-left md:px-6">
                  <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">Nacional</p>
                  <p className="mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                    Atuação em Todo o Brasil
                  </p>
                </div>
                <div className="rounded-lg bg-[#091124]/40 p-3 sm:bg-transparent sm:p-0 text-center md:text-left md:px-6">
                  <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">Segurança</p>
                  <p className="mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                    Rigor Técnico & Processual
                  </p>
                </div>
                <div className="rounded-lg bg-[#091124]/40 p-3 sm:bg-transparent sm:p-0 text-center md:text-left md:pl-6">
                  <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">100%</p>
                  <p className="mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                    Atendimento Personalizado
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="border-b border-slate-800/80 bg-[#091124] py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Compromisso profissional
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Uma nova postura na prestação de serviços jurídicos.
              </h2>
            </FadeIn>

            <FadeIn delay={100} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <ValueCard
                number="01"
                title="Comunicação Clara"
                description="Linguagem sem juridiquês, transparência em cada fase e respostas ágeis."
              />
              <ValueCard
                number="02"
                title="Planejamento & Viabilidade"
                description="Avaliação criteriosa de viabilidade e custos antes de qualquer medida."
              />
              <ValueCard
                number="03"
                title="Acompanhamento Ativo"
                description="Prazos monitorados de perto e avisos proativos sobre movimentações."
              />
              <ValueCard
                number="04"
                title="Foco em Eficiência"
                description="Prioridade na solução inteligente do conflito, na mesa de acordo ou nos tribunais."
              />
            </FadeIn>
          </div>
        </section>

        <section id="atuacao" className="scroll-mt-16 sm:scroll-mt-20 border-b border-slate-800/80 bg-[#070D1B] py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Prática jurídica
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Áreas de Atuação
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400">
                Soluções jurídicas com visão multidisciplinar para prevenir passivos, proteger seu patrimônio e garantir vitórias consistentes.
              </p>
            </FadeIn>

            <FadeIn delay={100} className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PracticeCard
                featured
                icon={<Landmark className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Imobiliário"
                description="Regularização de imóveis, usucapião, contratos, locações e proteção patrimonial."
              />
              <PracticeCard
                featured
                icon={<Briefcase className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Trabalhista"
                description="Defesa combativa para empregados e consultoria preventiva e contenciosa para empresas."
              />
              <PracticeCard
                featured
                icon={<Scale className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Cível"
                description="Litígios patrimoniais, recuperação de créditos, contratos civis e reparações por danos."
              />
              <PracticeCard
                featured
                icon={<Users2 className="h-5 w-5 stroke-[1.8]" />}
                title="Família e Sucessões"
                description="Condução humanizada e segura em divórcios, inventários, partilhas e pensões."
              />
              <PracticeCard
                icon={<Building2 className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Empresarial"
                description="Suporte jurídico contínuo, contratos comerciais e recuperação de créditos."
              />
              <PracticeCard
                icon={<Shield className="h-5 w-5 stroke-[1.8]" />}
                title="Direito do Consumidor"
                description="Combate a abusos de empresas, fraudes e negativações indevidas."
              />
              <PracticeCard
                icon={<Anchor className="h-5 w-5 stroke-[1.8]" />}
                title="Marítimo, Portuário e Aduaneiro"
                description="Assessoria em comércio exterior, contratos marítimos, liberação de cargas e setor portuário."
              />
            </FadeIn>
          </div>
        </section>

        <section id="escritorio" className="scroll-mt-16 sm:scroll-mt-20 border-b border-slate-800/80 bg-[#091124] py-14 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
            <FadeIn className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                O escritório
              </p>
              <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Soluções construídas com ética, técnica apurada e foco no resultado.
              </h2>
              <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
                Com estrutura moderna e atuação consultiva e contenciosa, unimos a precisão do Direito ao dinamismo digital, garantindo que cada cliente tenha uma defesa robusta e um plano de ação sob medida.
              </p>
            </FadeIn>
            <FadeIn delay={150} className="relative lg:col-span-6">
              <div className="relative aspect-[4/5] w-full max-w-[340px] sm:max-w-none mx-auto overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-slate-800/80">
                <Image 
                  src="/erick-chair.jpg" 
                  alt="Dr. Erick do Carmo no escritório" 
                  fill
                  className="object-cover object-top" 
                  quality={95}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 w-full max-w-sm sm:max-w-xs mx-auto sm:mx-0 rounded-xl border border-slate-700/80 bg-[#0B152B]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Compromisso
                </p>
                <p className="mt-1 text-xs sm:text-sm font-semibold leading-snug text-white">
                  Defesa combativa, transparência contínua e foco na melhor solução para o cliente.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="faq" className="scroll-mt-16 sm:scroll-mt-20 border-b border-slate-800/80 bg-[#070D1B] py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Esclarecimentos
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Perguntas Frequentes
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400">
                Tire suas principais dúvidas sobre o modelo de atuação e o início do atendimento.
              </p>
            </FadeIn>

            <FadeIn delay={100} className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <FaqCard
                question="Como funciona a primeira análise do caso?"
                answer="Realizamos uma análise prévia e criteriosa dos fatos e documentos para avaliar a viabilidade jurídica, esclarecendo riscos, custos e os caminhos jurídicos mais adequados antes de qualquer contratação."
              />
              <FaqCard
                question="O atendimento pode ser feito 100% online?"
                answer="Sim. Por meio do processo judicial eletrônico e reuniões seguras por videoconferência e WhatsApp, atendemos com total validade jurídica e praticidade clientes de qualquer estado ou residentes no exterior."
              />
              <FaqCard
                question="Como são definidos os honorários e custos do serviço?"
                answer="Trabalhamos com total clareza e previsibilidade. Cada proposta de honorários é personalizada conforme a complexidade e a modalidade da demanda, detalhada formalmente em contrato antes do início dos trabalhos."
              />
              <FaqCard
                question="Como acompanho o andamento do meu processo?"
                answer="Priorizamos a comunicação ativa e contínua. Você recebe atualizações periódicas a cada movimentação relevante no tribunal e conta com canal direto para esclarecer dúvidas a qualquer momento."
              />
            </FadeIn>
          </div>
        </section>

        <section id="contato" className="scroll-mt-16 sm:scroll-mt-20 border-b border-slate-800/80 bg-[#091124] py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <FadeIn className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-[#0B152B] via-[#0E1B38] to-[#0A1328] p-5 sm:p-12 lg:p-16 shadow-2xl">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Atendimento
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                  Vamos analisar o seu caso?
                </h2>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
                  Conte com uma análise inicial atenta para entender o cenário, os
                  riscos e os caminhos jurídicos possíveis.
                </p>

                <div className="mt-6 sm:mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-950/50 transition-colors hover:bg-blue-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Conversar pelo WhatsApp
                  </a>
                  <EmailButton email="adverickdocarmo@gmail.com" />
                </div>

                <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-3.5 border-t border-slate-800/80 pt-6 sm:pt-8 text-sm text-slate-300 sm:grid-cols-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                    (13) 99789-4415
                  </a>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                    <span className="text-xs sm:text-sm text-slate-300">adverickdocarmo@gmail.com</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <span>Seg–Sex, das 09h às 18h</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <span>Praia Grande - SP | Atendimento presencial e online</span>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white hover:bg-slate-800"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="bg-[#050811] py-10 sm:py-12 text-xs text-slate-500 border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-white">ERICK DO CARMO ADVOGADOS</p>
            <p className="mt-0.5 text-slate-400">Assessoria Jurídica</p>
          </div>

          <div className="max-w-md text-left text-slate-500 md:text-center">
            <p>
              Informativo profissional em conformidade com o Código de Ética e
              Disciplina da OAB e o Provimento nº 205/2021.
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} Erick do Carmo Advogados. Todos os direitos reservados.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 transition-colors hover:text-white"
          >
            <Lock className="h-3 w-3" />
            Acesso Restrito
          </Link>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp — z-40 para ficar abaixo do drawer mobile z-[70] */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar pelo WhatsApp com Erick do Carmo Advogados"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex h-12 w-12 sm:h-auto sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#25D366] p-3 sm:px-4 sm:py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        <span className="hidden text-xs font-semibold sm:inline-block">
          Fale com o Advogado
        </span>
      </a>
    </div>
  );
}

function ValueCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0E1830] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-[#121E3C]">
      <span className="text-xs font-mono font-semibold text-blue-400">{number}</span>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
    </div>
  );
}

function PracticeCard({
  featured = false,
  icon,
  title,
  description,
}: {
  featured?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-lg border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        featured
          ? "border-blue-500/50 bg-gradient-to-b from-blue-950/80 to-[#0F1D3D] text-white shadow-md shadow-blue-950/50 hover:border-blue-400"
          : "border-slate-800 bg-[#0E1830] text-slate-300 hover:border-slate-700 hover:bg-[#121E3C]"
      }`}
    >
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-sm ${
          featured ? "bg-blue-600/30 text-blue-300" : "bg-slate-800 text-slate-300"
        }`}
      >
        {icon}
      </div>
      {featured && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">
          Área de destaque
        </p>
      )}
      <h3 className={`text-lg font-semibold ${featured ? "mt-2 text-white" : "text-white"}`}>
        {title}
      </h3>
      <p className={`mt-2 text-sm leading-relaxed ${featured ? "text-slate-300" : "text-slate-400"}`}>
        {description}
      </p>
    </div>
  );
}

function FaqCard({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0E1830] p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-[#121E3C]">
      <h3 className="text-base font-semibold text-white">{question}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{answer}</p>
    </div>
  );
}

