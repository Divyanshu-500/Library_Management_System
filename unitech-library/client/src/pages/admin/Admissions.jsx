import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, LogOut as CloseIcon, ArrowRightLeft, Search } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null);

  const load = () => api.get(`/admissions${statusFilter ? `?status=${statusFilter}` : ""}`).then(({ data }) => setAdmissions(data.data));
  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Admissions</h1>
          <p className="mt-1 text-sm text-slate-500">Assign students to seats, transfer, or close admissions.</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="left">Left</option>
            <option value="transferred">Transferred</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={16} /> New Admission</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Student</th>
              <th className="px-5 py-3 text-left">Library / Class / Seat</th>
              <th className="px-5 py-3 text-left">Admission Date</th>
              <th className="px-5 py-3 text-left">Fee</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admissions.map((a) => (
              <tr key={a._id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3 font-medium text-ink-800">{a.student?.fullName}</td>
                <td className="px-5 py-3 text-slate-500">{a.library?.name} · {a.classRoom?.name} · {a.seat?.seatNumber}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(a.admissionDate).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-slate-600">₹{a.monthlyFee}</td>
                <td className="px-5 py-3"><Badge status={a.status} /></td>
                <td className="px-5 py-3">
                  {a.status === "active" && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setTransferTarget(a)} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Transfer">
                        <ArrowRightLeft size={14} />
                      </button>
                      <button onClick={() => setCloseTarget(a)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Close / Left">
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {admissions.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No admissions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateAdmissionModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load(); }} />
      <CloseAdmissionModal admission={closeTarget} onClose={() => setCloseTarget(null)} onDone={() => { setCloseTarget(null); load(); }} />
      <TransferModal admission={transferTarget} onClose={() => setTransferTarget(null)} onDone={() => { setTransferTarget(null); load(); }} />
    </div>
  );
}

function CreateAdmissionModal({ open, onClose, onCreated }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [libraries, setLibraries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [seats, setSeats] = useState([]);
  const [form, setForm] = useState({ student: "", library: "", classRoom: "", seat: "", monthlyFee: 400, admissionDate: new Date().toISOString().slice(0, 10) });

  useEffect(() => { if (open) { api.get("/libraries").then(({ data }) => setLibraries(data.data)); } }, [open]);
  useEffect(() => { const t = setTimeout(() => { if (search) api.get(`/students?search=${search}`).then(({ data }) => setStudents(data.data)); }, 300); return () => clearTimeout(t); }, [search]);
  useEffect(() => { if (form.library) api.get(`/classes?library=${form.library}`).then(({ data }) => setClasses(data.data)); }, [form.library]);
  useEffect(() => { if (form.classRoom) api.get(`/seats?classRoom=${form.classRoom}`).then(({ data }) => setSeats(data.data.filter((s) => s.status === "available"))); }, [form.classRoom]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admissions", form);
      toast.success("Admission created — seat assigned");
      onCreated();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Admission">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Search Student</label>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Type name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {students.length > 0 && (
            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-1.5">
              {students.map((s) => (
                <button type="button" key={s._id} onClick={() => { setForm({ ...form, student: s._id }); setSearch(s.fullName); setStudents([]); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                  <span>{s.fullName}</span><span className="text-xs text-slate-400">{s.mobile}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select className="input" required value={form.library} onChange={(e) => setForm({ ...form, library: e.target.value, classRoom: "", seat: "" })}>
            <option value="">Library</option>
            {libraries.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <select className="input" required value={form.classRoom} onChange={(e) => setForm({ ...form, classRoom: e.target.value, seat: "" })}>
            <option value="">Class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <select className="input" required value={form.seat} onChange={(e) => setForm({ ...form, seat: e.target.value })}>
          <option value="">Select available seat</option>
          {seats.map((s) => <option key={s._id} value={s._id}>{s.seatNumber}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Admission Date</label><input type="date" className="input" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} /></div>
          <div><label className="label">Monthly Fee (₹)</label><input type="number" className="input" required value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })} /></div>
        </div>

        <button type="submit" disabled={!form.student || !form.seat} className="btn-primary w-full">Assign Seat</button>
      </form>
    </Modal>
  );
}

function CloseAdmissionModal({ admission, onClose, onDone }) {
  const [status, setStatus] = useState("left");
  const [reason, setReason] = useState("");
  const [leavingDate, setLeavingDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admissions/${admission._id}/close`, { status, reason, leavingDate });
      toast.success("Admission closed — seat is now available");
      onDone();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={!!admission} onClose={onClose} title={`Close Admission — ${admission?.student?.fullName || ""}`}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="left">Left</option><option value="completed">Completed</option><option value="suspended">Suspended</option>
          </select>
        </div>
        <div><label className="label">Leaving Date</label><input type="date" className="input" value={leavingDate} onChange={(e) => setLeavingDate(e.target.value)} /></div>
        <div><label className="label">Reason (optional)</label><input className="input" placeholder="e.g. Shifted to another city" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <button type="submit" className="btn-danger w-full">Confirm — Vacate Seat</button>
      </form>
    </Modal>
  );
}

function TransferModal({ admission, onClose, onDone }) {
  const [libraries, setLibraries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [seats, setSeats] = useState([]);
  const [form, setForm] = useState({ newLibrary: "", newClassRoom: "", newSeat: "", transferDate: new Date().toISOString().slice(0, 10) });

  useEffect(() => { if (admission) api.get("/libraries").then(({ data }) => setLibraries(data.data)); }, [admission]);
  useEffect(() => { if (form.newLibrary) api.get(`/classes?library=${form.newLibrary}`).then(({ data }) => setClasses(data.data)); }, [form.newLibrary]);
  useEffect(() => { if (form.newClassRoom) api.get(`/seats?classRoom=${form.newClassRoom}`).then(({ data }) => setSeats(data.data.filter((s) => s.status === "available"))); }, [form.newClassRoom]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admissions/${admission._id}/transfer`, form);
      toast.success("Student transferred to new seat");
      onDone();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={!!admission} onClose={onClose} title={`Transfer — ${admission?.student?.fullName || ""}`}>
      <form onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          Current: {admission?.library?.name} · {admission?.classRoom?.name} · Seat {admission?.seat?.seatNumber}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <select className="input" required value={form.newLibrary} onChange={(e) => setForm({ ...form, newLibrary: e.target.value, newClassRoom: "", newSeat: "" })}>
            <option value="">New Library</option>
            {libraries.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <select className="input" required value={form.newClassRoom} onChange={(e) => setForm({ ...form, newClassRoom: e.target.value, newSeat: "" })}>
            <option value="">New Class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <select className="input" required value={form.newSeat} onChange={(e) => setForm({ ...form, newSeat: e.target.value })}>
          <option value="">New Seat</option>
          {seats.map((s) => <option key={s._id} value={s._id}>{s.seatNumber}</option>)}
        </select>
        <div><label className="label">Transfer Date</label><input type="date" className="input" value={form.transferDate} onChange={(e) => setForm({ ...form, transferDate: e.target.value })} /></div>
        <button type="submit" disabled={!form.newSeat} className="btn-primary w-full">Confirm Transfer</button>
      </form>
    </Modal>
  );
}
