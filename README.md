# MediCore HMS — Hospital Management System

A full-stack Hospital Management System with appointment booking, built with React + Node.js/Express + PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Query, Zustand, React Router v6 |
| Backend | Node.js 20, Express 4, Sequelize ORM, Socket.IO |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.IO |
| Dev | Docker Compose |

---

## Project Structure

```
hms/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, logger
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # Sequelize models (User, Doctor, Patient, Appointment…)
│   │   └── routes/         # Express routers
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (layout, forms…)
│   │   ├── context/        # Zustand stores (auth)
│   │   ├── hooks/          # useSocket, custom hooks
│   │   ├── pages/          # Route-level page components
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── appointments/  # List, Book, Detail
│   │   │   ├── patients/
│   │   │   ├── doctors/
│   │   │   ├── records/
│   │   │   ├── prescriptions/
│   │   │   ├── lab/
│   │   │   ├── pharmacy/
│   │   │   └── billing/
│   │   └── services/       # Axios API client
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

## Quick Start

### Option A — Docker Compose (recommended)

```bash
git clone <repo>
cd hms
cp backend/.env.example backend/.env   # edit secrets
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API docs: http://localhost:5000/health

### Option B — Local dev

**Backend**
```bash
cd backend
cp .env.example .env        # fill in DB credentials
npm install
npm run db:migrate          # create tables
npm run db:seed             # seed demo data
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## User Roles & Access

| Role | Capabilities |
|---|---|
| **admin** | Full access — users, settings, all records |
| **doctor** | Own schedule, patients, records, prescriptions, lab orders |
| **nurse** | Patients, records, lab orders |
| **receptionist** | Appointments, patients, doctors |
| **pharmacist** | Prescriptions, pharmacy inventory |
| **lab_tech** | Lab orders & results |
| **patient** | Own appointments, records, prescriptions, billing |

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/appointments/slots?doctor_id=&date=
GET    /api/appointments
POST   /api/appointments        ← book (conflict-safe DB transaction)
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id    ← cancel

GET/POST/PUT /api/patients
GET/POST/PUT /api/doctors
GET/POST/PUT /api/records/patient/:id
GET/POST/PUT /api/prescriptions/patient/:id
GET/POST/PUT /api/lab-orders
GET/POST/PUT /api/medicines
GET/POST/PUT /api/invoices
GET/POST/PUT /api/departments
GET/POST/PUT /api/users
```

All endpoints require `Authorization: Bearer <token>` except auth routes.

---

## Key Features Implemented

- ✅ Role-based authentication (JWT access + refresh tokens)
- ✅ Conflict-safe appointment booking (DB-level lock + unique index)
- ✅ Real-time notifications (Socket.IO)
- ✅ Multi-role sidebar navigation
- ✅ 3-step appointment booking wizard
- ✅ Doctor slot availability query
- ✅ Soft-delete on all models (paranoid mode)
- ✅ Rate limiting, Helmet, CORS
- ✅ Centralized error handling
- ✅ Structured logging (Winston)
- ✅ Docker Compose dev environment

## Remaining TODOs (stubs ready)

- [ ] Patient CRUD controller
- [ ] Doctor CRUD controller
- [ ] Medical records controller
- [ ] Prescription controller + dispensing flow
- [ ] Lab order controller + result upload (S3)
- [ ] Pharmacy inventory controller
- [ ] Invoice generation + payment recording
- [ ] Email/SMS reminders (nodemailer / Twilio)
- [ ] Admin dashboard analytics
- [ ] File upload to AWS S3
- [ ] Swagger/OpenAPI docs
- [ ] Unit & integration tests
