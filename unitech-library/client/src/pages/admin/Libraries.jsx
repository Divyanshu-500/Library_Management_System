import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Building2, Armchair, Users } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

const emptyForm = { name: "", code: "", address: "", contactNumber: "", openingTime: "06:00", closingTime: "22:00" };

export default function Libraries() {
  const [libraries, setLibraries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get("/libraries").then(({ data }) => setLibraries(data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (lib) => { setEditing(lib); setForm(lib); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/libraries/${editing._id}`, form);
        toast.success("Library updated");
      } else {
        await api.post("/libraries", form);
        toast.success("Library created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (lib) => {
    if (!confirm(`Delete "${lib.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/libraries/${lib._id}`);
      toast.success("Library deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Libraries</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all Unitech Digital Library branches.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Library
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {libraries.map((lib) => (
          <div key={lib._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-display font-bold text-ink-900">{lib.name}</p>
                  <p className="text-xs font-medium text-slate-400">{lib.code}</p>
                </div>
              </div>
              <Badge status={lib.status === "active" ? "active" : "inactive"}>{lib.status}</Badge>
            </div>

            <p className="mt-3 text-sm text-slate-500">{lib.address || "No address set"}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="flex items-center justify-center gap-1.5 font-display text-lg font-bold text-ink-900">
                  <Armchair size={15} className="text-slate-400" /> {lib.totalSeats}
                </p>
                <p className="text-[11px] text-slate-400">Total Seats</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="flex items-center justify-center gap-1.5 font-display text-lg font-bold text-emerald-700">
                  <Users size={15} /> {lib.totalSeats - lib.occupiedSeats}
                </p>
                <p className="text-[11px] text-emerald-600">Available</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => openEdit(lib)} className="btn-secondary flex-1 !py-2 text-xs">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => handleDelete(lib)} className="btn-danger !py-2 !px-3 text-xs">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Library" : "Add Library"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Library Name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Library Code</label>
              <input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="LIB1" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Contact</label>
              <input className="input" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Opens</label>
              <input type="time" className="input" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Closes</label>
              <input type="time" className="input" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {editing ? "Save Changes" : "Create Library"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
