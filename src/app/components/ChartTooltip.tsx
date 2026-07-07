export function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2330] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && (
        <div className="text-slate-400 mb-1.5 font-medium">{label}</div>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-mono font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
