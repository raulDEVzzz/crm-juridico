import type React from "react";
import {
  Anchor,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Scale,
  Shield,
  ShieldCheck,
  UserCheck,
  Users2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { whatsappUrl, socialLinks } from "@/lib/constants";
import { MobileNav } from "@/components/landing/mobile-nav";

const email = "adverickdocarmo@gmail.com";

const values = [
  {
    n: "01",
    t: "Comunicação Clara",
    d: "Linguagem sem juridiquês, transparência em cada fase processual e respostas ágeis às suas dúvidas.",
  },
  {
    n: "02",
    t: "Planejamento & Viabilidade",
    d: "Avaliação criteriosa de viabilidade e custos antes de qualquer medida judicial ou extrajudicial.",
  },
  {
    n: "03",
    t: "Acompanhamento Ativo",
    d: "Prazos monitorados de perto e avisos proativos sobre cada movimentação relevante no processo.",
  },
  {
    n: "04",
    t: "Foco em Eficiência",
    d: "Prioridade na solução inteligente do conflito, seja na mesa de acordo ou nos tribunais.",
  },
];

const areas = [
  {
    i: Landmark,
    t: "Direito Imobiliário",
    d: "Regularização de imóveis, usucapião, contratos de compra e venda, locações e proteção patrimonial estratégica.",
    span: "md:col-span-2 md:row-span-2",
    big: true,
  },
  {
    i: Briefcase,
    t: "Direito Trabalhista",
    d: "Defesa combativa dos direitos do trabalhador e consultoria preventiva e contenciosa para empresas.",
    span: "md:col-span-2",
  },
  {
    i: Scale,
    t: "Direito Cível",
    d: "Litígios patrimoniais, recuperação de créditos, cobranças, contratos civis e reparações por danos morais e materiais.",
  },
  {
    i: Users2,
    t: "Família e Sucessões",
    d: "Condução humanizada e segura em divórcios, inventários, partilhas de bens, pensão e planejamento sucessório.",
  },
  {
    i: Building2,
    t: "Direito Empresarial",
    d: "Suporte jurídico contínuo para empresas, elaboração de contratos comerciais e redução de passivos.",
  },
  {
    i: Shield,
    t: "Direito do Consumidor",
    d: "Combate a abusos de instituições financeiras, empresas de telefonia, planos de saúde e negativações indevidas.",
  },
  {
    i: Anchor,
    t: "Marítimo, Portuário e Aduaneiro",
    d: "Assessoria em comércio exterior, contratos marítimos, demurrage, liberação de cargas e suporte no setor portuário.",
    span: "md:col-span-2",
  },
];

const faqs = [
  {
    q: "Como funciona a primeira análise do caso?",
    a: "Realizamos uma análise prévia e criteriosa dos fatos e documentos para avaliar a viabilidade jurídica, esclarecendo riscos, custos e os caminhos jurídicos mais adequados antes de qualquer contratação.",
  },
  {
    q: "O atendimento pode ser feito 100% online?",
    a: "Sim. Por meio do processo judicial eletrônico e reuniões seguras por videoconferência e WhatsApp, atendemos com total validade jurídica e praticidade clientes de qualquer estado ou residentes no exterior.",
  },
  {
    q: "Como são definidos os honorários e custos do serviço?",
    a: "Trabalhamos com total clareza e previsibilidade. Cada proposta de honorários é personalizada conforme a complexidade e a modalidade da demanda, detalhada formalmente em contrato antes do início dos trabalhos.",
  },
  {
    q: "Como acompanho o andamento do meu processo?",
    a: "Priorizamos a comunicação ativa e contínua. Você recebe atualizações periódicas a cada movimentação relevante no tribunal e conta com canal direto para esclarecer dúvidas a qualquer momento.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-3">
      <span className="h-px w-8 bg-gold/60" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">{children}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#090E1A] text-slate-100 overflow-x-hidden selection:bg-gold selection:text-ink">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090E1A]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Erick do Carmo Advogados">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gold/30 bg-gold-soft p-0.5 shadow-sm">
              <Image src="/logo.jpg" alt="Logo EC" width={40} height={40} className="object-cover rounded-md" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-semibold tracking-[0.12em] sm:text-[15px] text-white uppercase">
                ERICK DO CARMO
              </span>
              <span className="block truncate text-[9px] uppercase tracking-[0.22em] text-slate-400 sm:text-[10px]">
                Advogados • OAB/SP 465.833
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex">
            {[
              ["#atuacao", "Áreas de Atuação"],
              ["#escritorio", "O Escritório"],
              ["#faq", "Dúvidas"],
              ["#contato", "Contato"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-gold">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
            >
              <Lock className="h-3 w-3 text-gold" />
              <span className="hidden sm:inline">Área Restrita</span>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold hidden items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold sm:inline-flex"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Agendar Consulta
            </a>
            <div className="lg:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="hero-glow absolute inset-0 -z-10" />
          <div className="grid-lines absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-12 lg:pb-28 lg:pt-20">
            <div className="rise lg:col-span-7">
              <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Assessoria Jurídica de Excelência • OAB/SP 465.833
              </div>
              <h1 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.75rem]">
                <em className="text-gold-gradient font-normal not-italic">Segurança jurídica</em> e firmeza na defesa dos seus interesses.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Atuação jurídica conduzida por advogado especialista, com foco em soluções legais pautadas no rigor técnico, na análise minuciosa de riscos e na absoluta transparência.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold"
                >
                  <MessageCircle className="h-4 w-4" /> Agendar Consulta
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#atuacao"
                  className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-medium"
                >
                  Conhecer áreas de atuação
                </a>
              </div>
            </div>

            <div className="rise relative mx-auto w-full max-w-sm lg:col-span-5 lg:ml-auto" style={{ animationDelay: "150ms" }}>
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gold/15 blur-3xl" />
              <div className="glass rounded-[1.75rem] p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
                  <Image
                    src="/erick-photo.jpg"
                    alt="Dr. Erick do Carmo"
                    fill
                    priority
                    quality={95}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#070A12] to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 glass rounded-2xl px-4 py-3">
                    <p className="font-serif text-lg text-white">Dr. Erick do Carmo</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-medium">Advogado • OAB/SP 465.833</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
            <div className="glass grid grid-cols-2 overflow-hidden rounded-3xl md:grid-cols-4 border border-white/10">
              {[
                ["+300", "Clientes Atendidos"],
                ["Nacional", "Atuação em Todo o Brasil"],
                ["Segurança", "Rigor Técnico & Processual"],
                ["100%", "Atendimento Personalizado"],
              ].map(([v, l], i) => (
                <div
                  key={l}
                  className={`p-6 sm:p-8 ${i % 2 ? "border-l border-white/10" : ""} ${
                    i > 1 ? "border-t border-white/10 md:border-t-0" : ""
                  } ${i === 2 ? "md:border-l md:border-white/10" : ""}`}
                >
                  <p className="font-serif text-3xl sm:text-4xl text-white">{v}</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="border-t border-white/10 bg-[#070C18] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-12 items-start">
              <div className="lg:col-span-4">
                <Eyebrow>Compromisso profissional</Eyebrow>
                <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
                  Uma nova postura na prestação de serviços jurídicos.
                </h2>
                <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-400">
                  Defesa técnica focada na solução do conflito com agilidade, ética e contato direto com o advogado responsável pelo seu processo.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
                {values.map((v) => (
                  <div key={v.n} className="glass card-hover group rounded-2xl p-7">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl text-gold/70 transition-colors group-hover:text-gold">{v.n}</span>
                      <span className="h-px w-12 bg-white/15 transition-all group-hover:w-20 group-hover:bg-gold/60" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-white">{v.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{v.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Áreas — Bento */}
        <section id="atuacao" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <Eyebrow>Prática jurídica</Eyebrow>
                <h2 className="font-serif text-3xl sm:text-5xl text-white">Áreas de Atuação</h2>
              </div>
              <p className="max-w-md text-sm sm:text-base text-slate-400">
                Soluções jurídicas com visão multidisciplinar para prevenir passivos, proteger seu patrimônio e garantir vitórias consistentes.
              </p>
            </div>
            <div className="mt-12 grid auto-rows-[minmax(190px,auto)] gap-4 md:grid-cols-4">
              {areas.map(({ i: Icon, t, d, span, big }) => (
                <a
                  key={t}
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glass card-hover group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 ${span ?? ""}`}
                >
                  {big && <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold-soft text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100" />
                  </div>
                  <div className="relative mt-8">
                    <h3 className={`font-serif text-white ${big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>{t}</h3>
                    <p className={`mt-3 leading-relaxed text-slate-300 ${big ? "max-w-sm text-sm sm:text-base" : "text-xs sm:text-sm"}`}>{d}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Escritório */}
        <section id="escritorio" className="scroll-mt-20 border-y border-white/10 bg-[#070C18] py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="glass rounded-[1.75rem] p-2">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem]">
                  <Image
                    src="/erick-chair.jpg"
                    alt="Dr. Erick do Carmo no escritório"
                    fill
                    quality={95}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="glass absolute -bottom-6 right-4 hidden rounded-2xl px-6 py-4 sm:block border border-white/10">
                <p className="font-serif text-3xl text-gold">+300</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Clientes atendidos</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Eyebrow>O escritório</Eyebrow>
              <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
                Soluções construídas com ética, técnica apurada e foco no resultado.
              </h2>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300">
                Com estrutura moderna e atuação consultiva e contenciosa, unimos a precisão do Direito ao dinamismo digital, garantindo que cada cliente tenha uma defesa robusta e um plano de ação sob medida.
              </p>
              <figure className="mt-8 border-l-2 border-gold/60 pl-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">Compromisso</p>
                <blockquote className="mt-2 font-serif text-xl sm:text-2xl italic leading-snug text-slate-200">
                  “Defesa combativa, transparência contínua e foco na melhor solução para o cliente.”
                </blockquote>
              </figure>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>Esclarecimentos</Eyebrow>
              <h2 className="font-serif text-3xl sm:text-5xl text-white">Perguntas Frequentes</h2>
              <p className="mt-5 text-sm sm:text-base text-slate-400">
                Tire suas principais dúvidas sobre o modelo de atuação e o início do atendimento.
              </p>
            </div>
            <div className="space-y-3 lg:col-span-8">
              {faqs.map((f, i) => (
                <details
                  key={f.q}
                  className="glass group rounded-2xl px-6 py-5 transition-colors open:border-gold/40 sm:px-8 border border-white/10"
                  open={i === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-serif text-xl text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-base font-medium text-white sm:text-lg">{f.q}</span>
                    <Plus className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="mt-4 pl-10 text-sm leading-relaxed text-slate-300 sm:text-base">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="scroll-mt-20 px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="glass relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-7 sm:p-12 border border-white/10">
            <div className="hero-glow absolute inset-0 -z-10" />
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <Eyebrow>Atendimento</Eyebrow>
                <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
                  Vamos analisar o seu caso?
                </h2>
                <p className="mt-5 max-w-md text-base sm:text-lg text-slate-300">
                  Conte com uma análise inicial atenta para entender o cenário, os riscos e os caminhos jurídicos possíveis.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {[
                    [ShieldCheck, "Sigilo Profissional Absoluto"],
                    [UserCheck, "Atendimento com Advogado"],
                    [Clock, "Retorno Ágil em Horário Comercial"],
                  ].map(([I, l]) => {
                    const Ic = I as typeof Clock;
                    return (
                      <span
                        key={l as string}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#070A12]/60 px-3.5 py-1.5 text-xs text-slate-300"
                      >
                        <Ic className="h-3.5 w-3.5 text-gold" /> {l as string}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold"
                  >
                    <MessageCircle className="h-4 w-4" /> Conversar pelo WhatsApp
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-medium"
                  >
                    <Mail className="h-4 w-4" /> Enviar e-mail
                  </a>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6">
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#070A12]/60 overflow-hidden">
                  {[
                    [Phone, "Telefone / WhatsApp", "(13) 99789-4415", whatsappUrl],
                    [Mail, "E-mail", email, `mailto:${email}`],
                    [Clock, "Horário", "Seg–Sex, das 09h às 18h"],
                    [MapPin, "Localização", "Praia Grande - SP | Atendimento presencial e online"],
                  ].map(([I, k, v, href]) => {
                    const Ic = I as typeof Clock;
                    const inner = (
                      <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
                          <Ic className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{k as string}</p>
                          <p className="break-words text-sm font-medium text-white sm:text-base">{v as string}</p>
                        </div>
                      </>
                    );
                    return (
                      <li key={k as string}>
                        {href ? (
                          <a
                            href={href as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-white/5"
                          >
                            {inner}
                          </a>
                        ) : (
                          <div className="flex items-center gap-4 p-4 sm:p-5">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                    >
                      <Icon className="h-3.5 w-3.5 text-gold" /> {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#05080F]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-xs text-slate-400 sm:px-8 md:grid-cols-3 md:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-white">ERICK DO CARMO ADVOGADOS</p>
            <p className="mt-1 uppercase tracking-[0.2em] text-slate-400">Assessoria Jurídica • OAB/SP 465.833</p>
          </div>
          <div className="space-y-1.5 md:text-center text-slate-400">
            <p>Informativo profissional em conformidade com o Código de Ética e Disciplina da OAB e o Provimento nº 205/2021.</p>
            <p>© {new Date().getFullYear()} Erick do Carmo Advogados. Todos os direitos reservados.</p>
            <p>
              Desenvolvido por{" "}
              <a
                href="https://wa.me/5513991666744?text=Ol%C3%A1%2C%20Raul!%20Vi%20o%20site%20que%20voc%C3%AA%20desenvolveu%20para%20o%20Dr.%20Erick%20e%20gostaria%20de%20um%20or%C3%A7amento."
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline font-medium"
              >
                Raul Almeida
              </a>
            </p>
          </div>
          <Link
            href="/login"
            className="btn-ghost inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 md:justify-self-end text-xs"
          >
            <Lock className="h-3 w-3 text-gold" /> Acesso Restrito
          </Link>
        </div>
      </footer>

      {/* Botão flutuante WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar pelo WhatsApp com Erick do Carmo Advogados"
        className="btn-gold fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
