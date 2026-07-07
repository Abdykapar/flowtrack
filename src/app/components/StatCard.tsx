import { ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  Icon,
  accent,
  trend,
  up,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ElementType;
  accent: string;
  trend?: string;
  up?: boolean;
}) {
  return (
    <div className="bg-[#171A21] border border-white/6 rounded-xl p-4 flex flex-col gap-3 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={13} />
        </div>
      </div>
      <div>
        <div
          className="text-[26px] font-bold text-white tracking-tight"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {value}
        </div>
        <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
          <ArrowUpRight size={11} className={up ? "" : "rotate-180"} />
          {trend}
        </div>
      )}
    </div>
  );
}
