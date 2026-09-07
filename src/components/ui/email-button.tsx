"use client";

import { useState } from "react";
import { Check, Copy, Mail, ExternalLink } from "lucide-react";

interface EmailButtonProps {
  email: string;
}

export function EmailButton({ email }: EmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback se o navegador bloquear clipboard
      const input = document.createElement("input");
      input.value = email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email
  )}`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar endereço de e-mail"
        className={`inline-flex items-center justify-center gap-2 rounded-md border px-5 py-3.5 sm:py-3 text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
          copied
            ? "border-emerald-500/80 bg-emerald-950/60 text-emerald-300 shadow-sm"
            : "border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span>E-mail copiado!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-slate-400" />
            <span>Copiar e-mail</span>
          </>
        )}
      </button>

      <a
        href={gmailComposeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-800/40 px-3.5 py-2.5 sm:py-3 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200 w-full sm:w-auto"
        title="Abrir diretamente no Gmail Web"
      >
        <Mail className="h-3.5 w-3.5 text-blue-400" />
        <span>Abrir no Gmail</span>
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    </div>
  );
}
