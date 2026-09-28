import { User, Lock, Clock } from "lucide-react";

const statusStyle = {
  available: {
    ring: "ring-emerald-300/60",
    bg: "bg-gradient-to-br from-emerald-50 to-white",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  occupied: {
    ring: "ring-rose-300/60",
    bg: "bg-gradient-to-br from-rose-50 to-white",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
  reserved: {
    ring: "ring-amber-300/60",
    bg: "bg-gradient-to-br from-amber-50 to-white",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  inactive: {
    ring: "ring-slate-200",
    bg: "bg-slate-50",
    dot: "bg-slate-400",
    text: "text-slate-400",
  },
};

/**
 * seats: [{ _id, seatNumber, status, currentAdmission: { student: { fullName, photoUrl } } }]
 * onSeatClick(seat)
 */
export default function SeatGrid({ seats = [], onSeatClick, readOnly = false }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
        {Object.entries({
          available: "Available",
          occupied: "Occupied",
          reserved: "Reserved",
          inactive: "Inactive",
        }).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${statusStyle[key].dot}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {seats.map((seat) => {
          const s = statusStyle[seat.status] || statusStyle.inactive;
          const studentName = seat.currentAdmission?.student?.fullName;
          const photo = seat.currentAdmission?.student?.photoUrl;

          return (
            <button
              key={seat._id}
              onClick={() => onSeatClick?.(seat)}
              disabled={readOnly && seat.status === "inactive"}
              className={`group relative flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl border border-white ${s.bg} p-3 shadow-card ring-2 ${s.ring} transition-all hover:-translate-y-1 hover:shadow-soft`}
            >
              <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${s.dot}`} />

              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-sm">
                {photo ? (
                  <img src={photo} alt={studentName} className="h-full w-full object-cover" />
                ) : seat.status === "occupied" ? (
                  <User size={18} className="text-slate-500" />
                ) : seat.status === "inactive" ? (
                  <Lock size={16} className="text-slate-400" />
                ) : seat.status === "reserved" ? (
                  <Clock size={16} className="text-amber-500" />
                ) : (
                  <span className="text-sm font-bold text-slate-400">+</span>
                )}
              </div>

              <p className="font-display text-sm font-bold text-ink-800">{seat.seatNumber}</p>
              <p className={`w-full truncate px-1 text-center text-[11px] font-medium ${s.text}`}>
                {studentName || (seat.status === "available" ? "Vacant" : seat.status)}
              </p>
            </button>
          );
        })}
      </div>

      {seats.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-400">
          No seats found for this class yet.
        </div>
      )}
    </div>
  );
}
