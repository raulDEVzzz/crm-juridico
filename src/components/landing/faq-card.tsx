"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqCard({
  number,
  question,
  answer,
}: {
  number: string;
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800/80 bg-[#091124]/70 shadow-sm transition-all duration-300 hover:border-slate-700 hover:bg-[#0C1630]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-start gap-3.5 p-5 sm:p-6 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-700/80 bg-slate-800/80 text-xs font-semibold text-blue-400 font-mono">
          {number}
        </span>
        <span className="min-w-0 flex-1 font-serif text-base sm:text-lg font-medium text-white leading-snug">
          {question}
        </span>
        <ChevronDown
          className={`mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180 text-blue-400" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-sm leading-relaxed text-slate-300/90 pl-[calc(1.25rem+1.75rem+0.875rem)] sm:pl-[calc(1.5rem+1.75rem+0.875rem)]">
          {answer}
        </p>
      </div>
    </div>
  );
}
