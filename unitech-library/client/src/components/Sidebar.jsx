import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, DoorOpen, Armchair, Users, ClipboardList,
  Wallet, FileBarChart, ScrollText, LogOut, Library, KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/libraries", label: "Libraries", icon: Building2 },
  { to: "/admin/classes", label: "Classes", icon: DoorOpen },
  { to: "/admin/seats", label: "Seat Grid", icon: Armchair },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/admissions", label: "Admissions", icon: ClipboardList },
  { to: "/admin/fees", label: "Fees", icon: Wallet },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/change-password", label: "Change Password", icon: KeyRound },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-ink-900 text-slate-300">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow">
          <Library size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight text-white">Unitech</p>
          <p className="text-[11px] font-medium tracking-wide text-slate-400">DIGITAL LIBRARY</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-600/15 text-white shadow-[inset_2px_0_0_0_theme(colors.brand.500)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-sm font-bold text-ink-900">
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{admin?.name}</p>
            <p className="truncate text-xs capitalize text-slate-400">{admin?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
