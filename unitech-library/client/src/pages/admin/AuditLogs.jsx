import { useEffect, useState } from "react";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/audit-logs?page=${page}&limit=20`).then(({ data }) => { setLogs(data.data); setTotalPages(data.totalPages); });
  }, [page]);

  const actionColor = (action) => {
    if (action.includes("DELETE")) return "text-rose-600 bg-rose-50";
    if (action.includes("CREATE")) return "text-emerald-600 bg-emerald-50";
    if (action.includes("UPDATE") || action.includes("TRANSFER")) return "text-amber-600 bg-amber-50";
    return "text-brand-600 bg-brand-50";
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Audit Logs</h1>
      <p className="mt-1 text-sm text-slate-500">A full trail of every admin action, for accountability.</p>

      <div className="mt-6 card divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log._id} className="flex items-start gap-3 p-4">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${actionColor(log.action)}`}>
              <ScrollText size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-800">{log.description}</p>
              <p className="mt-0.5 text-xs text-slate-400">{log.adminName} · {new Date(log.createdAt).toLocaleString()}</p>
            </div>
            <span className={`badge ${actionColor(log.action)}`}>{log.action.replaceAll("_", " ")}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="p-10 text-center text-sm text-slate-400">No activity recorded yet.</p>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-3 !py-2 disabled:opacity-40"><ChevronLeft size={14} /></button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-3 !py-2 disabled:opacity-40"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
