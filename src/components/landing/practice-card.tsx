export function PracticeCard({
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
      className={`group relative rounded-xl border p-6 transition-all duration-300 ${
        featured
          ? "border-blue-500/40 bg-gradient-to-b from-[#0D1B3E]/80 to-[#0A1224]/80 shadow-lg shadow-blue-950/40 hover:border-blue-400 hover:bg-[#10224D]/90"
          : "border-slate-800/80 bg-[#0A1224]/60 hover:border-slate-700 hover:bg-[#0E1933]"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-blue-400 transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
        {featured && (
          <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
            Destaque
          </span>
        )}
      </div>
      <h3 className="font-serif text-lg font-medium text-white tracking-tight">
        {title}
      </h3>
      <p className={`mt-2.5 text-sm leading-relaxed ${featured ? "text-slate-200/90" : "text-slate-300/90"}`}>
        {description}
      </p>
    </div>
  );
}
