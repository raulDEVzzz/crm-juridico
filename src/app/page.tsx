import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
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
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Erick do Carmo Advogado">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-white">
              <Image src="/logo.jpg" alt="Logo EC" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <span className="block text-base font-semibold uppercase tracking-tight text-neutral-900">
                Erick do Carmo Advogado
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                Consultoria Jurídica
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <Link href="#atuacao" className="transition-colors hover:text-neutral-900">
              Áreas de Atuação
            </Link>
            <Link href="#escritorio" className="transition-colors hover:text-neutral-900">
              O Escritório
            </Link>
            <Link href="#faq" className="transition-colors hover:text-neutral-900">
              Dúvidas
            </Link>
            <Link href="#contato" className="transition-colors hover:text-neutral-900">
              Contato
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-flex"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Agendar Consulta
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <Lock className="h-3 w-3 text-neutral-500" />
              Área Restrita
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-neutral-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:items-center">
            <FadeIn className="max-w-2xl">
              <p className="mb-5 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Mais de 300 clientes atendidos em todo o Brasil
              </p>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-5xl xl:text-6xl">
                Segurança jurídica e firmeza na defesa dos seus interesses.
              </h1>
              <p className="mt-7 text-lg font-normal leading-relaxed text-neutral-600 sm:text-xl">
                Atuação conduzida por especialista Pós-graduado em Direito Imobiliário
                e Direito Marítimo, Portuário e Aduaneiro. Soluções legais com rigor
                técnico, análise minuciosa de riscos e transparência.
              </p>

              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800"
                >
                  <MessageCircle className="h-4 w-4" />
                  Agendar Consulta
                </a>
                <Link
                  href="#atuacao"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-6 py-3.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  Conhecer áreas de atuação
                  <ArrowUpRight className="h-4 w-4 text-neutral-500" />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={150} className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border border-neutral-200/50">
                <Image 
                  src="/erick-photo.jpg" 
                  alt="Dr. Erick do Carmo" 
                  fill 
                  className="object-cover object-top" 
                  priority 
                  quality={95}
                  sizes="(min-width: 1024px) 50vw, 100vw" 
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Faixa de Métricas de Autoridade */}
        <section className="border-b border-neutral-800 bg-neutral-900 py-10 text-white">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <FadeIn direction="up">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:divide-x md:divide-neutral-800">
                <div className="text-center md:text-left md:pr-6">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">+300</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Clientes Atendidos
                  </p>
                </div>
                <div className="text-center md:text-left md:px-6">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Nacional</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Atuação em Todo o Brasil
                  </p>
                </div>
                <div className="text-center md:text-left md:px-6">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">2</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Áreas de Especialização
                  </p>
                </div>
                <div className="text-center md:text-left md:pl-6">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">100%</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Atendimento Personalizado
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="border-b border-neutral-200/80 bg-[#FAFAF9] py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Compromisso profissional
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Uma nova postura na prestação de serviços jurídicos.
              </h2>
            </FadeIn>

            <FadeIn delay={100} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <ValueCard
                number="01"
                title="Atendimento Direto"
                description="Seu caso conduzido diretamente pelo advogado responsável."
              />
              <ValueCard
                number="02"
                title="Estratégia baseada em Dados"
                description="Avaliação honesta de viabilidade e riscos antes de qualquer ação."
              />
              <ValueCard
                number="03"
                title="Acompanhamento Ativo"
                description="Prazos monitorados de perto e atualizações proativas ao cliente."
              />
              <ValueCard
                number="04"
                title="Foco em Eficiência"
                description="Prioridade na solução inteligente do conflito, seja amigável ou nos tribunais."
              />
            </FadeIn>
          </div>
        </section>

        <section id="atuacao" className="border-b border-neutral-200/80 bg-white py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Prática jurídica
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Áreas de Atuação
              </h2>
              <p className="mt-3 text-base text-neutral-600">
                Especialização para prevenir riscos, proteger patrimônio e defender seus
                interesses com segurança.
              </p>
            </FadeIn>

            <FadeIn delay={100} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PracticeCard
                featured
                icon={<Landmark className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Imobiliário"
                description="Regularização de imóveis, usucapião, contratos, locações e proteção patrimonial."
              />
              <PracticeCard
                featured
                icon={<Anchor className="h-5 w-5 stroke-[1.8]" />}
                title="Marítimo, Portuário e Aduaneiro"
                description="Assessoria em comércio exterior, contratos marítimos, liberação de cargas e atuação no setor portuário."
              />
              <PracticeCard
                icon={<Scale className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Cível"
                description="Litígios patrimoniais, cobranças estratégicas e reparações por danos."
              />
              <PracticeCard
                icon={<Briefcase className="h-5 w-5 stroke-[1.8]" />}
                title="Direito Trabalhista"
                description="Defesa combativa para empregados e consultoria preventiva para empregadores."
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
                icon={<Users2 className="h-5 w-5 stroke-[1.8]" />}
                title="Família e Sucessões"
                description="Condução humanizada em divórcios, inventários e pensões."
              />
            </FadeIn>
          </div>
        </section>

        <section id="escritorio" className="border-b border-neutral-200/80 bg-[#FAFAF9] py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:items-center">
            <FadeIn className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                O escritório
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Rigor técnico, ética e compromisso real com o resultado.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-neutral-600">
                Com sede em Praia Grande - SP e atendimento em todo o Brasil, atuamos
                com a convicção de que o Direito deve ser acessível e altamente
                resolutivo, oferecendo soluções customizadas para cada cliente.
              </p>
            </FadeIn>
            <FadeIn delay={150} className="relative lg:col-span-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border border-neutral-200/60">
                <Image 
                  src="/erick-chair.jpg" 
                  alt="Dr. Erick do Carmo no escritório" 
                  fill
                  className="object-cover object-top" 
                  quality={95}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 max-w-xs rounded-xl border border-neutral-200 bg-white p-5 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Especialização
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-neutral-900">
                  Pós-graduado em Direito Imobiliário e Direito Marítimo, Portuário e
                  Aduaneiro.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="faq" className="border-b border-neutral-200/80 bg-white py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Esclarecimentos
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Perguntas Frequentes
              </h2>
              <p className="mt-3 text-base text-neutral-600">
                Tire suas principais dúvidas sobre o modelo de atuação e o início do atendimento.
              </p>
            </FadeIn>

            <FadeIn delay={100} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              <FaqCard
                question="Como funciona a primeira análise do caso?"
                answer="Realizamos uma análise prévia e criteriosa dos fatos e documentos para avaliar a viabilidade jurídica, esclarecendo riscos, custos e as estratégias mais adequadas antes de qualquer contratação."
              />
              <FaqCard
                question="O atendimento pode ser feito 100% online?"
                answer="Sim. Por meio do processo judicial eletrônico e reuniões seguras por videoconferência e WhatsApp, atendemos com total validade jurídica e praticidade clientes de qualquer estado ou residentes no exterior."
              />
              <FaqCard
                question="O escritório atende demandas fora do Estado de São Paulo?"
                answer="Sim. Nossa atuação abrange processos e consultorias em todo o território nacional, atuando ativamente nas instâncias locais e perante os tribunais superiores."
              />
              <FaqCard
                question="Como recebo atualizações do meu processo?"
                answer="Priorizamos a transparência e a proatividade. Você terá contato direto com o advogado responsável e receberá atualizações periódicas e relatórios a cada andamento relevante."
              />
            </FadeIn>
          </div>
        </section>

        <section id="contato" className="border-b border-neutral-200/80 bg-[#FAFAF9] py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <FadeIn className="rounded-lg border border-neutral-300 bg-[#FAFAF9] p-8 sm:p-12 lg:p-16">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Atendimento
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                  Vamos analisar o seu caso?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-neutral-600">
                  Conte com uma análise inicial atenta para entender o cenário, os
                  riscos e os caminhos jurídicos possíveis.
                </p>

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Conversar pelo WhatsApp
                  </a>
                  <a
                    href="mailto:adverickdocarmo@gmail.com"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar e-mail
                  </a>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-4 border-t border-neutral-200 pt-8 text-sm text-neutral-600 sm:grid-cols-2">
                  <a
                    href="mailto:adverickdocarmo@gmail.com"
                    className="flex items-center gap-3 transition-colors hover:text-neutral-900"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-neutral-900" />
                    adverickdocarmo@gmail.com
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 transition-colors hover:text-neutral-900"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-neutral-900" />
                    (13) 99789-4415
                  </a>
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                    <span>Sede em Praia Grande - SP | Atendimento presencial e digital em todo o Brasil.</span>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                    <span>Segunda a Sexta, das 09h às 18h | Atendimento presencial sob agendamento prévio.</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
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

      <footer className="bg-white py-12 text-xs text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Erick do Carmo Advogado</p>
            <p className="mt-0.5 text-neutral-500">Consultoria e Assessoria Jurídica</p>
          </div>

          <div className="max-w-md text-left text-neutral-500 md:text-center">
            <p>
              Informativo profissional em conformidade com o Código de Ética e
              Disciplina da OAB e o Provimento nº 205/2021.
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} Erick do Carmo Advogado. Todos os direitos reservados.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <Lock className="h-3 w-3" />
            Acesso Restrito
          </Link>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar pelo WhatsApp com o Dr. Erick do Carmo"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
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
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-neutral-300">
      <span className="text-xs font-mono font-semibold text-neutral-400">{number}</span>
      <h3 className="mt-3 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{description}</p>
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
      className={`rounded-lg border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        featured
          ? "border-neutral-900 bg-neutral-900 text-white hover:border-neutral-700"
          : "border-neutral-200 bg-[#FAFAF9] hover:border-neutral-300 hover:bg-white"
      }`}
    >
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-sm ${
          featured ? "bg-white/15 text-white" : "bg-neutral-900 text-white"
        }`}
      >
        {icon}
      </div>
      {featured && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-300">
          Área de destaque
        </p>
      )}
      <h3 className={`text-lg font-semibold ${featured ? "mt-2 text-white" : "text-neutral-900"}`}>
        {title}
      </h3>
      <p className={`mt-2 text-sm leading-relaxed ${featured ? "text-neutral-300" : "text-neutral-600"}`}>
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
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300">
      <h3 className="text-base font-semibold text-neutral-900">{question}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{answer}</p>
    </div>
  );
}

