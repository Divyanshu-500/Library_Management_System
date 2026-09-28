import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Receipt, Trash2 } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";

export default function Fees() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recordOpen, setRecordOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (search) api.get(`/students?search=${search}`).then(({ data }) => setStudents(data.data)); else setStudents([]); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const selectStudent = async (s) => {
    setSelectedStudent(s);
    setStudents([]);
    setSearch(s.fullName);
    const { data } = await api.get(`/students/${s._id}`);
    setAdmissions(data.data.admissions);
    const { data: feeData } = await api.get(`/fees?student=${s._id}`);
    setPayments(feeData.data);
  };

  const refreshFees = async () => {
    const { data } = await api.get(`/fees?student=${selectedStudent._id}`);
    setPayments(data.data);
  };

  const activeAdmission = admissions.find((a) => a.status === "active");
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleDeletePayment = async (p) => {
    if (!confirm(`Delete payment of ₹${p.amount} for ${p.paidForMonth}?`)) return;
    try {
      await api.delete(`/fees/${p._id}`);
      toast.success("Payment record deleted");
      refreshFees();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Fees</h1>
          <p className="mt-1 text-sm text-slate-500">Search a student to record a payment or view fee history.</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search student by name or mobile..." value={search} onChange={(e) => { setSearch(e.target.value); setSelectedStudent(null); }} />
        </div>
        {students.length > 0 && (
          <div className="mt-2 max-w-md space-y-1 rounded-xl border border-slate-100 p-1.5">
            {students.map((s) => (
              <button key={s._id} onClick={() => selectStudent(s)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                <span>{s.fullName}</span><span className="text-xs text-slate-400">{s.mobile}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-1">
            <p className="font-display font-bold text-ink-900">{selectedStudent.fullName}</p>
            <p className="text-sm text-slate-500">{selectedStudent.mobile}</p>
            {activeAdmission ? (
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-500">Library: <span className="font-medium text-ink-800">{activeAdmission.library?.name}</span></p>
                <p className="text-slate-500">Seat: <span className="font-medium text-ink-800">{activeAdmission.seat?.seatNumber}</span></p>
                <p className="text-slate-500">Monthly Fee: <span className="font-medium text-ink-800">₹{activeAdmission.monthlyFee}</span></p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-amber-600">No active admission for this student.</p>
            )}
            <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-center">
              <p className="font-display text-2xl font-bold text-emerald-700">₹{totalPaid.toLocaleString("en-IN")}</p>
              <p className="text-xs text-emerald-600">Total Paid (all-time)</p>
            </div>
            <button
              disabled={!activeAdmission}
              onClick={() => setRecordOpen(true)}
              className="btn-primary mt-4 w-full"
            >
              <Plus size={16} /> Record Payment
            </button>
          </div>

          <div className="card p-5 lg:col-span-2">
            <p className="mb-3 text-sm font-semibold text-ink-800">Fee History</p>
            <div className="space-y-2">
              {payments.length ? payments.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Receipt size={16} /></div>
                    <div>
                      <p className="text-sm font-medium text-ink-800">{p.paidForMonth} · ₹{p.amount}</p>
                      <p className="text-xs text-slate-400">{new Date(p.paidDate).toLocaleDateString()} · {p.paymentMode} · {p.receiptNumber}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePayment(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button>
                </div>
              )) : <p className="py-8 text-center text-sm text-slate-400">No payments recorded yet.</p>}
            </div>
          </div>
        </div>
      )}

      <RecordPaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        admission={activeAdmission}
        onRecorded={() => { setRecordOpen(false); refreshFees(); }}
      />
    </div>
  );
}

function RecordPaymentModal({ open, onClose, admission, onRecorded }) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [form, setForm] = useState({ amount: admission?.monthlyFee || 400, paidForMonth: defaultMonth, paidDate: now.toISOString().slice(0, 10), paymentMode: "cash", remarks: "" });

  useEffect(() => { if (admission) setForm((f) => ({ ...f, amount: admission.monthlyFee })); }, [admission]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/fees", { ...form, admission: admission._id });
      toast.success("Payment recorded & receipt generated");
      onRecorded();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Fee Payment">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Amount (₹)</label><input type="number" className="input" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div><label className="label">For Month</label><input type="month" className="input" required value={form.paidForMonth} onChange={(e) => setForm({ ...form, paidForMonth: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Payment Date</label><input type="date" className="input" value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} /></div>
          <div>
            <label className="label">Mode</label>
            <select className="input" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
              <option value="cash">Cash</option><option value="online">Online</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
            </select>
          </div>
        </div>
        <div><label className="label">Remarks (optional)</label><input className="input" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
        <button type="submit" className="btn-primary w-full">Record Payment & Generate Receipt</button>
      </form>
    </Modal>
  );
}
