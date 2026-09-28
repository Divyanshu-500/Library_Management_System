import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Armchair, MapPin, ArrowRight } from "lucide-react";
import api from "../../services/api";

export default function PublicLibraries() {
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    api.get("/public/libraries").then(({ data }) => setLibraries(data.data));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-ink-900">Our Libraries</h1>
      <p className="mt-1 text-sm text-slate-500">Select a branch to view its seat availability.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {libraries.map((lib) => (
          <Link
            key={lib._id}
            to={`/libraries/${lib._id}`}
            className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Building2 size={20} />
            </div>
            <p className="mt-3 font-display font-bold text-ink-900">{lib.name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={12} /> {lib.address || "Address not set"}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <Armchair size={15} /> {lib.availableSeats} / {lib.totalSeats} available
              </span>
              <ArrowRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
