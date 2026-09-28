import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, LogOut as VacateIcon, ArrowRightLeft, Wallet } from "lucide-react";
import api from "../../services/api";
import SeatGrid from "../../components/SeatGrid";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

export default function Seats() {
  const [libraries, setLibraries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [seats, setSeats] = useState([]);
  const [activeSeat, setActiveSeat] = useState(null);
  const [seatDetail, setSeatDetail] = useState(null);

  useEffect(() => {
    api.get("/libraries").then(({ data }) => {
      setLibraries(data.data);
      if (data.data[0]) setSelectedLibrary(data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedLibrary) return;
    api.get(`/classes?library=${selectedLibrary}`).then(({ data }) => {
      setClasses(data.data);
      setSelectedClass(data.data[0]?._id || "");
    });
  }, [selectedLibrary]);

  const loadSeats = () => {
    if (!selectedClass) return;
    api.get(`/seats?classRoom=${selectedClass}`).then(({ data }) => setSeats(data.data));
  };

  useEffect(loadSeats, [selectedClass]);

  const openSeat = async (seat) => {
    setActiveSeat(seat);
    const { data } = await api.get(`/seats/${seat._id}`);
    setSeatDetail(data.data);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Seat Grid</h1>
          <p className="mt-1 text-sm text-slate-500">Click any seat to assign, vacate, or view history.</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-44" value={selectedLibrary} onChange={(e) => setSelectedLibrary(e.target.value)}>
            {libraries.map((l) => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
          <select className="input w-44" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.totalSeats} seats)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-6">
        <SeatGrid seats={seats} onSeatClick={openSeat} />
      </div>

      <Modal open={!!activeSeat} onClose={() => { setActiveSeat(null); setSeatDetail(null); }} title={`Seat ${activeSeat?.seatNumber || ""}`}>
        {seatDetail && (
          <SeatDetailPanel
            detail={seatDetail}
            onChanged={() => { loadSeats(); setActiveSeat(null); setSeatDetail(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

function SeatDetailPanel({ detail, onChanged }) {
  const { seat, history } = detail;
  const occupant = seat.currentAdmission?.student;

  const handleVacate = async () => {
    if (!confirm("Mark this student as left and vacate the seat?")) return;
    try {
      await api.put(`/admissions/${seat.currentAdmission._id}/close`, { status: "left" });
      toast.success("Seat vacated");
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge status={seat.status} />
        {seat.status === "occupied" && (
          <div className="flex gap-2">
            <button onClick={handleVacate} className="btn-secondary text-xs !px-3 !py-2">
              <VacateIcon size={14} /> Vacate
            </button>
          </div>
        )}
      </div>

      {occupant ? (
        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200">
            {occupant.photoUrl && <img src={occupant.photoUrl} className="h-full w-full object-cover" />}
          </div>
          <div>
            <p className="font-semibold text-ink-900">{occupant.fullName}</p>
            <p className="text-sm text-slate-500">{occupant.mobile}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          This seat is currently vacant. Assign a student from the Admissions page.
        </p>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Occupancy History</p>
        <div className="space-y-2">
          {history?.length ? (
            history.map((h) => (
              <div key={h._id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-ink-800">{h.studentNameSnapshot}</span>
                <span className="text-xs text-slate-400">
                  {new Date(h.fromDate).toLocaleDateString()} → {h.toDate ? new Date(h.toDate).toLocaleDateString() : "Present"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
