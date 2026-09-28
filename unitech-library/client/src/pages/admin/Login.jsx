import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library, Lock, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.requiresPasswordChange) {
        toast.success("Please set a new password to continue.");
        navigate("/admin/change-password");
        return;
      }

      toast.success("Welcome back!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:22px_22px] opacity-40" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl md:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <Library size={22} />
            </div>
            <span className="font-display text-lg font-bold">Unitech Digital Library</span>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Manage every seat.<br />Track every rupee.
            </h2>
            <p className="mt-3 text-sm text-brand-100/80">
              Libraries, classes, seats, admissions, and fee history — all in one dynamic
              admin console.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-brand-100/70">
            <div><p className="text-xl font-bold text-white">5+</p>Libraries</div>
            <div><p className="text-xl font-bold text-white">100+</p>Seats</div>
            <div><p className="text-xl font-bold text-white">24/7</p>Access</div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bg-white p-8 sm:p-10">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                <Library size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-ink-900">Unitech Library</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your libraries.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Protected admin area — Unitech Digital Library © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
