import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, DoorOpen, Armchair } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

const emptyForm = { library: "", name: "", floor: "", capacity: 25, description: "" };

export default function Classes() {
  const [libraries, setLibraries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterLibrary, setFilterLibrary] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadLibraries = () => api.get("/libraries").then(({ data }) => setLibraries(data.data));
  const loadClasses = () =>
    api.get(`/classes${filterLibrary ? `?library=${filterLibrary}` : ""}`).then(({ data }) => setClasses(data.data));

  useEffect(() => { loadLibraries(); }, []);
  useEffect(() => { loadClasses(); }, [filterLibrary]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, library: filterLibrary || libraries[0]?._id || "" });
    setModalOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ library: c.library?._id || c.library, name: c.name, floor: c.floor, capacity: c.capacity, description: c.description });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/classes/${editing._id}`, form);
        toast.success("Class updated");
      } else {
        await api.post("/classes", form);
        toast.success(`Class created with ${form.capacity} seats`);
      }
      setModalOpen(false);
      loadClasses();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"? All its seats will be removed too.`)) return;
    try {
      await api.delete(`/classes/${c._id}`);
      toast.success("Class deleted");
      loadClasses();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Classes / Rooms</h1>
          <p className="mt-1 text-sm text-slate-500">Each class auto-generates seats based on its capacity.</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-48" value={filterLibrary} onChange={(e) => setFilterLibrary(e.target.value)}>
            <option value="">All Libraries</option>
            {libraries.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Class</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <div key={c._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <DoorOpen size={20} />
                </div>
                <div>
                  <p className="font-display font-bold text-ink-900">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.library?.name} {c.floor && `· ${c.floor}`}</p>
                </div>
              </div>
              <Badge status={c.status === "active" ? "active" : "inactive"}>{c.status}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="flex items-center justify-center gap-1.5 font-display text-lg font-bold text-ink-900">
                  <Armchair size={15} className="text-slate-400" /> {c.totalSeats}
                </p>
                <p className="text-[11px] text-slate-400">Capacity</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="font-display text-lg font-bold text-emerald-700">{c.availableSeats}</p>
                <p className="text-[11px] text-emerald-600">Available</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => openEdit(c)} className="btn-secondary flex-1 !py-2 text-xs"><Pencil size={13} /> Edit</button>
              <button onClick={() => handleDelete(c)} className="btn-danger !py-2 !px-3 text-xs"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-400">
            No classes yet — click "Add Class" to create one.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Class" : "Add Class"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Library</label>
            <select className="input" required value={form.library} onChange={(e) => setForm({ ...form, library: e.target.value })}>
              <option value="">Select library</option>
              {libraries.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Class Name</label>
              <input className="input" required placeholder="Class A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Floor</label>
              <input className="input" placeholder="Ground Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">
              Capacity (seats) {editing && <span className="normal-case text-slate-400">— increasing this adds new seats automatically</span>}
            </label>
            <input type="number" min="1" className="input" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">{editing ? "Save Changes" : "Create Class & Generate Seats"}</button>
        </form>
      </Modal>
    </div>
  );
}
