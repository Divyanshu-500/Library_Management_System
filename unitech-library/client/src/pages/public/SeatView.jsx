import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, User } from "lucide-react";
import api from "../../services/api";

const dot = { available: "bg-emerald-500", occupied: "bg-rose-500", reserved: "bg-amber-500", inactive: "bg-slate-400" };
const ring = { available: "ring-emerald-300/60 bg-emerald-50/50", occupied: "ring-rose-300/60 bg-rose-50/50", reserved: "ring-amber-300/60 bg-amber-50/50", inactive: "ring-slate-200 bg-slate-50" };

export default function PublicSeatView() {
  const { id } = useParams();
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    api.get(`/public/classes/${id}/seats`).then(({ data }) => setSeats(data.data));
  }, [id]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/libraries" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ChevronLeft size={16} /> Back
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink-900">Seat Availability</h1>
      <p className="mt-1 text-sm text-slate-500">Only occupant names are shown for privacy.</p>

      <div className="mt-6 flex gap-4 text-xs font-medium text-slate-500">
        {Object.keys(dot).map((k) => (
          <span key={k} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${dot[k]}`} /> {k}</span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {seats.map((s) => (
          <div key={s._id} className={`flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl border border-white p-3 shadow-card ring-2 ${ring[s.status]}`}>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
              {s.occupantPhoto ? <img src={s.occupantPhoto} className="h-full w-full object-cover" /> : <User size={16} className="text-slate-400" />}
            </div>
            <p className="font-display text-sm font-bold text-ink-800">{s.seatNumber}</p>
            <p className="w-full truncate px-1 text-center text-[11px] text-slate-500">{s.occupantName || "Vacant"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
