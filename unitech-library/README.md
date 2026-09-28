# Unitech Digital Library Management & Seat Allocation System (UDLMS)

A full MERN-stack platform to manage multiple library branches, classes, seats,
student admissions, and fee history — with a public seat-availability site and
a full-featured admin console.

## Stack
- **Frontend:** React 18 (Vite) + Tailwind CSS + Recharts + Lucide icons
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT stored in an HTTP-only cookie
- **Images:** Cloudinary (student photos)

## What's included — this is now a complete, working project

**Backend — fully implemented (Express + MongoDB + JWT):**
- All models: Admin, Library, ClassRoom, Seat, Student, Admission, FeePayment, SeatHistory, AuditLog
- Full REST API: auth, libraries, classes (with **dynamic seat auto-generation** by capacity),
  seats, students (with photo upload), admissions (assign / close / **transfer with full history**),
  fees (record / history / receipt numbers), reports (dashboard stats, pending fees, collection by library),
  audit logs, and a **public** read-only API with limited student info.
- Core business rules enforced server-side:
  - A seat can never be double-booked (checked in `admissionController.js`)
  - Closing/transferring an admission automatically frees the seat and **preserves full occupancy history**
    (`SeatHistory` collection) — e.g. "Ramesh: Jan–Jun 2026 → Ram: Jul 2026–present"
  - Deleting a library/class/seat is blocked while it still has active students, protecting data integrity
  - Every create/update/delete/assign/vacate/transfer action is written to the Audit Log automatically

**Frontend — every admin module fully built (React + Tailwind):**
- **Login** — polished dark-glass admin sign-in screen
- **Dashboard** — live stat cards, fee-trend area chart, radial occupancy gauge, this-month collection
- **Libraries** — create/edit/delete branches, live seat-occupancy stats per card
- **Classes** — create/edit/delete classes; changing capacity **automatically creates the new seats**
- **Seat Grid** — the centerpiece: color-coded, photo-aware grid (green/red/amber/gray); click a seat to
  see its occupant, vacate them, or scroll through the complete occupancy history timeline
- **Students** — full profile form (basic info, address, ID proof, etc.), photo upload, search, and a
  detail view showing every past & present admission for that student
- **Admissions** — assign a searched student to an available seat; **Transfer** a student to a different
  seat/class/library (old seat freed, new one booked, history preserved on both); **Close/Left** a student
  with reason + date, instantly freeing the seat
- **Fees** — search a student, see their active seat & monthly fee, record a payment (auto-generates a
  receipt number), full chronological fee history, delete/correct mistaken entries
- **Reports** — pending-fees list for the current month (with CSV export) and a collection-by-library
  bar comparison
- **Audit Logs** — paginated, color-coded trail of every admin action for accountability
- **Public site** (no login) — Home → Libraries → Classes → Seat Grid, showing only seat number, status,
  and occupant name/photo — never phone, address, fees, or other private data

All pages use the shared design system: custom Tailwind theme (`brand`/`ink`/`gold` palette),
`Modal`, `Badge`, `StatCard`, `SeatGrid` components, and Inter + Sora fonts for a consistent,
professional look throughout.

## Getting Started

### 1. Backend
```bash
cd server
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run seed              # creates default admin: admin / Admin@123
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev                # starts on http://localhost:5173
```

Visit `http://localhost:5173` for the public site.

## Suggested Next Steps (polish / go-live)
1. Add PDF receipt generation on top of the existing `receiptNumber` field (the `pdfkit` package is already
   in `package.json` for this)
2. Add pagination to the Students/Admissions tables once data volume grows
3. Deploy: backend to Render/Railway, frontend to Vercel/Netlify, database on MongoDB Atlas,
   student photos on Cloudinary (already wired up)
4. Optional future features from the original spec: SMS/WhatsApp fee-due reminders, seat QR codes,
   Excel/PDF report exports beyond the CSV export already included in Reports
