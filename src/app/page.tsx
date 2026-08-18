import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  FileCheck2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  Shield,
  Users2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* ─── NAVEGAÇÃO SUPERIOR ──────────────────────────────────────── */}
      <header className="border-b border-neutral-200/80 bg-white/90 sticky top-0 z-50 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-900 text-white">
              <Scale className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="block text-base font-semibold tracking-tight text-neutral-900 uppercase">
                Erick Advocacia
              </span>
              <span className="block text-[11px] font-medium tracking-widest uppercase text-neutral-500">
                Consultoria Jurídica
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-600 font-medium">
            <Link
              href="#atuacao"
              className="transition-colors hover:text-neutral-900"
            >
              Áreas de Atuação
            </Link>
            <Link
              href="#escritorio"
              className="transition-colors hover:text-neutral-900"
            >
              O Escritório
            </Link>
            <Link
              href="#contato"
              className="transition-colors hover:text-neutral-900"
            >
              Contato
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta%20jurídica."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Agendar Consulta
            </Link>

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

      {/* ─── HERO SECTION ────────────────────────────────────────────── */}
      <section className="border-b border-neutral-200/80 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">
              Advocacia e Assessoria Jurídica
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl leading-[1.15]">
              Advocacia estratégica e resolutiva.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed">
              Atendimento personalizado e foco em resultados para defender seus
              interesses com rigor técnico e segurança jurídica.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20uma%20orientação%20jurídica."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com o Advogado
              </Link>
              <Link
                href="#atuacao"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-6 py-3.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                Conhecer Áreas de Atuação
                <ArrowUpRight className="h-4 w-4 text-neutral-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PILARES DE ATUAÇÃO ──────────────────────────────────────── */}
      <section className="border-b border-neutral-200/80 py-16 bg-[#FAFAF9]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-l-2 border-neutral-900 pl-4">
              <h3 className="text-base font-semibold text-neutral-900">
                Atendimento Direto
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Seu caso é conduzido diretamente pelo advogado responsável, com
                comunicação clara em todas as etapas.
              </p>
            </div>

            <div className="border-l-2 border-neutral-900 pl-4">
              <h3 className="text-base font-semibold text-neutral-900">
                Análise Criteriosa
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Avaliação detalhada de riscos e viabilidade antes de propor
                qualquer medida judicial ou extrajudicial.
              </p>
            </div>

            <div className="border-l-2 border-neutral-900 pl-4">
              <h3 className="text-base font-semibold text-neutral-900">
                Agilidade Processual
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Acompanhamento contínuo de prazos e andamentos com atualizações
                periódicas ao cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ÁREAS DE ATUAÇÃO ────────────────────────────────────────── */}
      <section id="atuacao" className="border-b border-neutral-200/80 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
              Prática Jurídica
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              Áreas de Atuação
            </h2>
            <p className="mt-3 text-neutral-600 text-base">
              Atuação contenciosa e consultiva voltada para pessoas físicas e empresas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Direito Cível */}
            <div className="rounded-md border border-neutral-200 bg-[#FAFAF9] p-6 transition-colors hover:border-neutral-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 text-white mb-4">
                <Scale className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Direito Cível
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Ações de cobrança, indenizações por danos morais e materiais e disputas patrimoniais.
              </p>
            </div>

            {/* Direito Contratual */}
            <div className="rounded-md border border-neutral-200 bg-[#FAFAF9] p-6 transition-colors hover:border-neutral-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 text-white mb-4">
                <FileCheck2 className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Direito Contratual
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Elaboração, análise de riscos e revisão de instrumentos contratuais civis e comerciais.
              </p>
            </div>

            {/* Direito Trabalhista */}
            <div className="rounded-md border border-neutral-200 bg-[#FAFAF9] p-6 transition-colors hover:border-neutral-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 text-white mb-4">
                <Briefcase className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Direito Trabalhista
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Defesa de direitos de empregados e consultoria jurídica preventiva para empregadores.
              </p>
            </div>

            {/* Direito Empresarial */}
            <div className="rounded-md border border-neutral-200 bg-[#FAFAF9] p-6 transition-colors hover:border-neutral-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 text-white mb-4">
                <Building2 className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Direito Empresarial
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Assessoria contínua para empresas, recuperação de créditos e resolução de conflitos comerciais.
              </p>
            </div>

            {/* Família e Sucessões */}
            <div className="rounded-md border border-neutral-200 bg-[#FAFAF9] p-6 transition-colors hover:border-neutral-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 text-white mb-4">
                <Users2 className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Família e Sucessões
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Divórcios consensuais e litigiosos, inventários, partilha de bens e pensão alimentícia.
              </p>
            </div>

            {/* Direito do Consumidor */}
            <div className="rounded-md border border-neutral-200 bg-[#FAFAF9] p-6 transition-colors hover:border-neutral-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 text-white mb-4">
                <Shield className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Direito do Consumidor
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Ações contra negativações indevidas, fraudes bancárias e abusos de prestadores de serviços.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── O ESCRITÓRIO ────────────────────────────────────────────── */}
      <section id="escritorio" className="border-b border-neutral-200/80 py-24 bg-[#FAFAF9]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
                Compromisso Profissional
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                O Escritório
              </h2>
              <div className="mt-6 space-y-4 text-neutral-600 text-base leading-relaxed">
                <p>
                  O escritório <strong>Erick Advocacia</strong> atua com base no
                  rigor técnico, na conduta ética e na prestação de contas
                  constante ao cliente.
                </p>
                <p>
                  Cada demanda é analisada de forma individualizada para definir
                  a estratégia mais eficiente, seja pela via consensual ou pela
                  atuação contenciosa nos tribunais.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-md border border-neutral-200 bg-white p-6">
                <span className="text-xs font-mono font-semibold text-neutral-400">01</span>
                <h4 className="mt-2 text-base font-semibold text-neutral-900">
                  Transparência
                </h4>
                <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                  Clareza sobre os riscos, custos e perspectivas reais de cada processo.
                </p>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-6">
                <span className="text-xs font-mono font-semibold text-neutral-400">02</span>
                <h4 className="mt-2 text-base font-semibold text-neutral-900">
                  Atuação Nacional
                </h4>
                <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                  Atendimento presencial e representação eletrônica em tribunais de todo o país.
                </p>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-6">
                <span className="text-xs font-mono font-semibold text-neutral-400">03</span>
                <h4 className="mt-2 text-base font-semibold text-neutral-900">
                  Sigilo e Ética
                </h4>
                <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                  Preservação irrestrita do sigilo profissional e das informações dos clientes.
                </p>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-6">
                <span className="text-xs font-mono font-semibold text-neutral-400">04</span>
                <h4 className="mt-2 text-base font-semibold text-neutral-900">
                  Foco em Resultados
                </h4>
                <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                  Busca pela resolução prática do conflito no menor prazo viável.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTATO ─────────────────────────────────────────────────── */}
      <section id="contato" className="border-b border-neutral-200/80 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="rounded-lg border border-neutral-300 bg-[#FAFAF9] p-8 sm:p-12 lg:p-16">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
                Atendimento
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                Agende uma consulta jurídica
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                Entre em contato para apresentar seu caso e receber uma avaliação inicial.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="https://wa.me/5511999999999?text=Olá,%20Dr.%20Erick!%20Gostaria%20de%20uma%20consulta%20jurídica."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                  <MessageCircle className="h-4 w-4" />
                  Conversar pelo WhatsApp
                </Link>
                <Link
                  href="mailto:contato@erickadvocacia.com.br"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  <Mail className="h-4 w-4" />
                  Enviar E-mail
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-500 pt-8 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-700 shrink-0" />
                  <span>Atendimento: Segunda a Sexta, das 09h às 18h</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-700 shrink-0" />
                  <span>Atendimento presencial e digital em todo o Brasil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-white py-12 text-xs text-neutral-500">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-neutral-900 text-sm">
                Erick Advocacia
              </p>
              <p className="mt-0.5 text-neutral-500">
                Consultoria e Assessoria Jurídica
              </p>
            </div>

            <div className="text-left md:text-center text-neutral-500 max-w-md">
              <p>
                Informativo profissional em conformidade com o Código de Ética e
                Disciplina da OAB e o Provimento nº 205/2021.
              </p>
              <p className="mt-1">
                © {new Date().getFullYear()} Erick Advocacia. Todos os direitos reservados.
              </p>
            </div>

            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
              >
                <Lock className="h-3 w-3" />
                Acesso Restrito
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
