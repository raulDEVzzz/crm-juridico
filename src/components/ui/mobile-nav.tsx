"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle } from "lucide-react";

const whatsappUrl =
  "https://api.whatsapp.com/message/DO2RHGYHLCLVH1?autoload=1&app_absent=0";

const navLinks = [
  { href: "#atuacao", label: "Áreas de Atuação" },
  { href: "#escritorio", label: "O Escritório" },
  { href: "#faq", label: "Dúvidas" },
  { href: "#contato", label: "Contato" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu de navegação"
        className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-800/60 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegacao"
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-[#070D1B] shadow-2xl border-l border-slate-800/80 transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-tight text-white">
              ERICK DO CARMO ADVOGADOS
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Assessoria Jurídica
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800/80 px-6 py-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-950/50 transition-colors hover:bg-blue-500"
          >
            <MessageCircle className="h-4 w-4" />
            Agendar Consulta
          </a>
        </div>
      </div>
    </>
  );
}
