import { Link } from "react-router-dom";
import { Library, ArrowRight, Armchair, Clock, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <Library size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-ink-900">Unitech Digital Library</span>
          </div>
          <Link to="/admin/login" className="btn-secondary !py-2 text-sm">Admin Login</Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink-900 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:22px_22px] opacity-30" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="badge bg-white/10 text-brand-200">Check real-time seat availability</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Find your seat at <span className="text-brand-300">Unitech Digital Library</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Browse our library branches and see which seats are currently available — no login required.
          </p>
          <Link to="/libraries" className="btn-primary mt-8 inline-flex px-6 py-3 text-base">
            View Libraries <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Armchair, title: "Live Seat Status", text: "See exactly which seats are open in every class." },
            { icon: Clock, title: "Flexible Hours", text: "Check opening and closing times for each branch." },
            { icon: ShieldCheck, title: "Privacy First", text: "Only occupant names are shown — never private data." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={20} />
              </div>
              <p className="font-display font-bold text-ink-900">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
