"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  MessageCircle,
  Briefcase,
  Building2,
  HelpCircle,
  Phone,
  Lock,
  ArrowRight,
  Shield,
} from "lucide-react";

const whatsappUrl =
  "https://api.whatsapp.com/message/DO2RHGYHLCLVH1?autoload=1&app_absent=0";

const navLinks = [
  {
    href: "#atuacao",
    label: "Áreas de Atuação",
    description: "Imobiliário, Trabalhista, Cível e mais",
    icon: Briefcase,
  },
  {
    href: "#escritorio",
    label: "O Escritório",
    description: "Atuação, ética e trajetória",
    icon: Building2,
  },
  {
    href: "#faq",
    label: "Dúvidas Frequentes",
    description: "Honorários, prazos e atendimento",
    icon: HelpCircle,
  },
  {
    href: "#contato",
    label: "Contato & Consulta",
    description: "Canais de atendimento direto",
    icon: Phone,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleLinkClick = (href: string) => {
    setOpen(false);
    // Em dispositivos móveis, um pequeno atraso garante que o overflow do body
    // seja restaurado antes de navegar para a âncora suavemente
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <>
      {/* Botão Hamburger — visível apenas em mobile com área de toque de 44px */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu de navegação"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-200 shadow-sm transition-all duration-200 active:scale-95 hover:bg-slate-700 hover:text-white md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay escuro com z-index alto para cobrir todos os elementos flutuantes */}
      <div
        className={`fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer lateral com z-index [70] */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`fixed right-0 top-0 z-[70] flex h-full w-[85vw] max-w-sm flex-col bg-[#070D1B] border-l border-slate-800/80 shadow-2xl transition-all duration-300 ease-out md:hidden ${
          open
            ? "translate-x-0 opacity-100 pointer-events-auto visible"
            : "translate-x-full opacity-0 pointer-events-none invisible"
        }`}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-white">
                ERICK DO CARMO
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Assessoria Jurídica
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links de navegação com ícones e descrições */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Navegação
          </p>
          {navLinks.map(({ href, label, description, icon: Icon }) => (
            <button
              key={href}
              type="button"
              onClick={() => handleLinkClick(href)}
              className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all duration-200 hover:bg-slate-800/70 active:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/90 text-blue-400 border border-slate-700/60 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-white">
                    {label}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {description}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </button>
          ))}

          <div className="my-3 border-t border-slate-800/80" />

          {/* Link para Área Restrita do CRM no Mobile */}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="group flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#0B152B]/60 px-3.5 py-3 text-left transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:text-white">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-200">
                  Área Restrita
                </span>
                <span className="block text-xs text-slate-400">
                  Acesso exclusivo de clientes
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
          </Link>
        </nav>

        {/* Rodapé do drawer com CTA principal */}
        <div className="border-t border-slate-800/80 bg-[#050914] p-5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/60 transition-all active:scale-98 hover:bg-blue-500"
          >
            <MessageCircle className="h-4 w-4" />
            Agendar Consulta no WhatsApp
          </a>
          <p className="mt-2.5 text-center text-[11px] text-slate-400">
            Atendimento Segunda a Sexta, 09h às 18h
          </p>
        </div>
      </div>
    </>
  );
}

