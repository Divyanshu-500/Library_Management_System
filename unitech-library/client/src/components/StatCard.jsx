export default function StatCard({ icon: Icon, label, value, tone = "brand", suffix }) {
  const tones = {
    brand: "from-brand-500 to-brand-700 text-brand-600 bg-brand-50",
    green: "from-emerald-500 to-emerald-700 text-emerald-600 bg-emerald-50",
    amber: "from-amber-400 to-amber-600 text-amber-600 bg-amber-50",
    rose: "from-rose-500 to-rose-700 text-rose-600 bg-rose-50",
    ink: "from-ink-700 to-ink-900 text-ink-700 bg-slate-100",
  };
  const [gradFrom, gradTo, textColor, bgSoft] = tones[tone].split(" ");

  return (
    <div className="card group relative overflow-hidden p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {value}
            {suffix && <span className="ml-1 text-sm font-medium text-slate-400">{suffix}</span>}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgSoft}`}>
          <Icon size={20} className={textColor} />
        </div>
      </div>
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradFrom} ${gradTo} opacity-70`} />
    </div>
  );
}
