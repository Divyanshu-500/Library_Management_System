const styles = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  available: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  occupied: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  reserved: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  inactive: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  left: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  completed: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
  transferred: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  suspended: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

export default function Badge({ status, children }) {
  return (
    <span className={`badge capitalize ${styles[status] || styles.inactive}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children || status}
    </span>
  );
}
