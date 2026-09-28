import { useEffect, useState } from "react";
import { AlertTriangle, Building2, Download } from "lucide-react";
import api from "../../services/api";

export default function Reports() {
  const [pending, setPending] = useState({ data: [], month: "", count: 0 });
  const [collection, setCollection] = useState([]);

  useEffect(() => {
    api.get("/reports/pending-fees").then(({ data }) => setPending(data));
    api.get("/reports/collection-by-library").then(({ data }) => setCollection(data.data));
  }, []);

  const exportCSV = () => {
    const rows = [["Student", "Mobile", "Library", "Seat"], ...pending.data.map((a) => [a.student?.fullName, a.student?.mobile, a.library?.name, a.seat?.seatNumber])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pending-fees-${pending.month}.csv`; a.click();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">Pending fees and collection breakdown by library.</p>

      <div className="mt-6 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <AlertTriangle size={16} className="text-amber-500" /> Pending Fees — {pending.month} ({pending.count})
          </p>
          <button onClick={exportCSV} className="btn-secondary !py-2 text-xs"><Download size={14} /> Export CSV</button>
        </div>
        <div className="space-y-2">
          {pending.data.map((a) => (
            <div key={a._id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/40 p-3 text-sm">
              <div>
                <p className="font-medium text-ink-800">{a.student?.fullName}</p>
                <p className="text-xs text-slate-500">{a.student?.mobile} · {a.library?.name} · Seat {a.seat?.seatNumber}</p>
              </div>
              <span className="badge bg-amber-100 text-amber-700">Due</span>
            </div>
          ))}
          {pending.data.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No pending fees this month 🎉</p>}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Building2 size={16} className="text-brand-500" /> Collection by Library
        </p>
        <div className="space-y-3">
          {collection.map((c) => (
            <div key={c.library} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{c.library}</span>
              <div className="flex items-center gap-3">
                <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (c.totalCollection / (Math.max(...collection.map(x => x.totalCollection), 1))) * 100)}%` }} />
                </div>
                <span className="w-24 text-right font-display text-sm font-bold text-ink-900">₹{c.totalCollection.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
