import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DoorOpen, ArrowRight, ChevronLeft } from "lucide-react";
import api from "../../services/api";

export default function PublicLibraryDetail() {
  const { id } = useParams();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get(`/public/libraries/${id}/classes`).then(({ data }) => setClasses(data.data));
  }, [id]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/libraries" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ChevronLeft size={16} /> All libraries
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink-900">Classes</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a class to see its live seat layout.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Link key={c._id} to={`/classes/${c._id}`} className="card group p-5 hover:-translate-y-1 hover:shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <DoorOpen size={20} />
            </div>
            <p className="mt-3 font-display font-bold text-ink-900">{c.name}</p>
            <p className="text-xs text-slate-400">{c.floor}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-600">{c.availableSeats} / {c.totalSeats} available</span>
              <ArrowRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
