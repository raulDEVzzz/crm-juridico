export function ValueCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative border-t border-slate-800/90 pt-5 sm:pt-6 transition-all duration-300 hover:border-slate-600">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium tracking-widest text-blue-400/90">{number}</span>
        <span className="h-1 w-1 rounded-full bg-blue-500/50" />
      </div>
      <h3 className="mt-3 font-serif text-lg font-medium text-white tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300/90">{description}</p>
    </div>
  );
}
