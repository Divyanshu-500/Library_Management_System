import { useEffect, useState } from "react";
import { Building2, Armchair, Users, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../services/api";
import StatCard from "../../components/StatCard";

const trendData = [
  { name: "Apr", value: 28000 },
  { name: "May", value: 31500 },
  { name: "Jun", value: 29800 },
  { name: "Jul", value: 34200 },
  { name: "Aug", value: 37600 },
  { name: "Sep", value: 39200 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/reports/dashboard").then(({ data }) => setStats(data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of all your libraries, right now.</p>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live data
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Libraries" value={stats?.libraries ?? "—"} tone="brand" />
        <StatCard icon={Armchair} label="Total Seats" value={stats?.totalSeats ?? "—"} tone="ink" />
        <StatCard icon={Users} label="Active Students" value={stats?.activeStudents ?? "—"} tone="green" />
        <StatCard
          icon={AlertTriangle}
          label="Pending Fees"
          value={stats?.pendingFees ?? "—"}
          tone="rose"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-800">Fee Collection Trend</p>
              <p className="text-xs text-slate-400">Last 6 months, all libraries combined</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={13} /> +12.4%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3562ff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3562ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6", fontSize: 13 }} />
              <Area type="monotone" dataKey="value" stroke="#3562ff" strokeWidth={2.5} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <p className="mb-4 text-sm font-semibold text-ink-800">Occupancy</p>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-slate-100">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#3562ff ${(stats?.occupancyRate || 0) * 3.6}deg, #eef1f6 0deg)`,
                }}
              />
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <p className="font-display text-2xl font-bold text-ink-900">{stats?.occupancyRate ?? 0}%</p>
                <p className="text-[11px] text-slate-400">Occupied</p>
              </div>
            </div>
            <div className="mt-5 flex w-full justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> Occupied: {stats?.occupiedSeats ?? "—"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Available: {stats?.availableSeats ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <p className="mb-1 text-sm font-semibold text-ink-800">This Month Collection</p>
        <p className="font-display text-3xl font-bold text-ink-900">
          ₹{(stats?.monthCollection ?? 0).toLocaleString("en-IN")}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
          <Wallet size={13} /> Across {stats?.classes ?? 0} classes in {stats?.libraries ?? 0} libraries
        </p>
      </div>
    </div>
  );
}
