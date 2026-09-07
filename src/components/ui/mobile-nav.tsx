"use client";

import { useState } from "react";
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
    description: "Atuação, ética e visão resolutiva",
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
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleLinkClick = (href: string) => {
    closeMenu();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="md:hidden">
      {/* Botão de alternância Menu / X */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-200 shadow-sm transition-colors hover:bg-slate-700 hover:text-white"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Menu dropdown sob o Header — idêntico ao da Área Restrita */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-[#070D1B]/98 backdrop-blur-md animate-in fade-in-0 slide-in-from-top-2 duration-200 border-t border-slate-800/80 sm:top-20">
          <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-5">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navegação
            </p>
            {navLinks.map(({ href, label, description, icon: Icon }) => (
              <button
                key={href}
                type="button"
                onClick={() => handleLinkClick(href)}
                className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-slate-800/80 active:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400 border border-slate-700/60 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
              </button>
            ))}

            <div className="my-2 border-t border-slate-800/80" />

            {/* Link para Área Restrita do CRM */}
            <Link
              href="/login"
              onClick={closeMenu}
              className="group flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#0B152B]/60 px-3.5 py-3 text-left transition-colors hover:border-slate-700 hover:bg-slate-800/80"
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

          {/* Rodapé com CTA WhatsApp */}
          <div className="border-t border-slate-800/80 bg-[#050914] p-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/60 transition-colors hover:bg-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              Agendar Consulta no WhatsApp
            </a>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Atendimento Segunda a Sexta, 09h às 18h
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


