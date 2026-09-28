import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, Phone, User, X } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

const emptyForm = {
  fullName: "", fatherName: "", motherName: "", mobile: "", alternateMobile: "", email: "",
  dob: "", gender: "male", address: "", village: "", district: "", state: "", pincode: "",
  college: "", course: "", occupation: "", emergencyContact: "", idProofType: "", idProofNumber: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const load = () => api.get(`/students${search ? `?search=${search}` : ""}`).then(({ data }) => setStudents(data.data));
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setPhoto(null); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ ...emptyForm, ...s, dob: s.dob ? s.dob.slice(0, 10) : "" });
    setPhoto(null);
    setModalOpen(true);
  };

  const openDetail = async (s) => {
    setDetailStudent(s);
    const { data } = await api.get(`/students/${s._id}`);
    setDetailData(data.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v));
      if (photo) fd.append("photo", photo);

      if (editing) {
        await api.put(`/students/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Student updated");
      } else {
        await api.post("/students", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Student created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (s) => {
    if (!confirm(`Delete student "${s.fullName}"?`)) return;
    try {
      await api.delete(`/students/${s._id}`);
      toast.success("Student deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">Manage student profiles and view their full history.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input w-64 pl-9" placeholder="Search name, mobile, ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Student</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Student</th>
              <th className="px-5 py-3 text-left">Mobile</th>
              <th className="px-5 py-3 text-left">Code</th>
              <th className="px-5 py-3 text-left">Registered</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50/60">
                <td className="cursor-pointer px-5 py-3" onClick={() => openDetail(s)}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
                      {s.photoUrl ? <img src={s.photoUrl} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-slate-400"><User size={14} /></div>}
                    </div>
                    <span className="font-medium text-ink-800">{s.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500"><span className="flex items-center gap-1.5"><Phone size={12} /> {s.mobile}</span></td>
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{s.studentCode}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(s.registrationDate).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(s)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
              {(photo ? URL.createObjectURL(photo) : form.photoUrl) ? (
                <img src={photo ? URL.createObjectURL(photo) : form.photoUrl} className="h-full w-full object-cover" />
              ) : <div className="flex h-full w-full items-center justify-center text-slate-300"><User size={24} /></div>}
            </div>
            <div>
              <label className="btn-secondary cursor-pointer !py-2 text-xs">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
              </label>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">Basic Info</legend>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className="input" required placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <input className="input" placeholder="Father's Name" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
              <input className="input" placeholder="Mother's Name" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
              <input className="input" placeholder="Alternate Mobile" value={form.alternateMobile} onChange={(e) => setForm({ ...form, alternateMobile: e.target.value })} />
              <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" type="date" placeholder="DOB" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">Address</legend>
            <input className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-4 gap-3">
              <input className="input" placeholder="Village/Town" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
              <input className="input" placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              <input className="input" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <input className="input" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">Additional</legend>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="College/School" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
              <input className="input" placeholder="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
              <input className="input" placeholder="Occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
              <input className="input" placeholder="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
              <input className="input" placeholder="ID Proof Type (Aadhar, etc.)" value={form.idProofType} onChange={(e) => setForm({ ...form, idProofType: e.target.value })} />
              <input className="input" placeholder="ID Proof Number" value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} />
            </div>
          </fieldset>

          <button type="submit" className="btn-primary w-full">{editing ? "Save Changes" : "Create Student"}</button>
        </form>
      </Modal>

      {/* Detail drawer */}
      <Modal open={!!detailStudent} onClose={() => { setDetailStudent(null); setDetailData(null); }} title={detailStudent?.fullName} size="lg">
        {detailData && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                {detailData.student.photoUrl && <img src={detailData.student.photoUrl} className="h-full w-full object-cover" />}
              </div>
              <div>
                <p className="font-display font-bold text-ink-900">{detailData.student.fullName}</p>
                <p className="text-sm text-slate-500">{detailData.student.mobile} · {detailData.student.studentCode}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Admission History</p>
              <div className="space-y-2">
                {detailData.admissions.length ? detailData.admissions.map((a) => (
                  <div key={a._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
                    <div>
                      <p className="font-medium text-ink-800">{a.library?.name} · {a.classRoom?.name} · Seat {a.seat?.seatNumber}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(a.admissionDate).toLocaleDateString()} → {a.leavingDate ? new Date(a.leavingDate).toLocaleDateString() : "Present"} · ₹{a.monthlyFee}/mo
                      </p>
                    </div>
                    <Badge status={a.status} />
                  </div>
                )) : <p className="text-sm text-slate-400">No admissions yet.</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
