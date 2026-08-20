import Link from "next/link";
import {
  Anchor,
  ArrowUpRight,
  Briefcase,
  Building2,
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
          <Link href="/" className="flex items-center gap-3" aria-label="Erick Advocacia">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-900 text-white">
              <Scale className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="block text-base font-semibold uppercase tracking-tight text-neutral-900">
                Erick Advocacia
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
        <section className="border-b border-neutral-200/80 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="max-w-4xl">
              <p className="mb-5 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Mais de 300 clientes atendidos em todo o Brasil
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Segurança jurídica e firmeza na defesa dos seus interesses.
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-normal leading-relaxed text-neutral-600 sm:text-xl">
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
            </div>
          </div>
        </section>

        <section className="border-b border-neutral-200/80 bg-[#FAFAF9] py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Compromisso profissional
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Uma nova postura na prestação de serviços jurídicos.
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            </div>
          </div>
        </section>

        <section id="atuacao" className="border-b border-neutral-200/80 bg-white py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="max-w-2xl">
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
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
          </div>
        </section>

        <section id="escritorio" className="border-b border-neutral-200/80 bg-[#FAFAF9] py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
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
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-7 lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Especialização
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-neutral-900">
                Pós-graduado em Direito Imobiliário e Direito Marítimo, Portuário e
                Aduaneiro.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                Uma atuação estratégica que combina conhecimento técnico, proximidade
                e leitura prática de cada situação.
              </p>
            </div>
          </div>
        </section>

        <section id="contato" className="border-b border-neutral-200/80 bg-white py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="rounded-lg border border-neutral-300 bg-[#FAFAF9] p-8 sm:p-12 lg:p-16">
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
                    <span>Sede em Praia Grande - SP | Atendimento em todo o Brasil.</span>
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
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 text-xs text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Erick Advocacia</p>
            <p className="mt-0.5 text-neutral-500">Consultoria e Assessoria Jurídica</p>
          </div>

          <div className="max-w-md text-left text-neutral-500 md:text-center">
            <p>
              Informativo profissional em conformidade com o Código de Ética e
              Disciplina da OAB e o Provimento nº 205/2021.
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} Erick Advocacia. Todos os direitos reservados.
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
    <div className="rounded-md border border-neutral-200 bg-white p-6">
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
      className={`rounded-md border p-6 transition-colors hover:border-neutral-400 ${
        featured ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-[#FAFAF9]"
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
