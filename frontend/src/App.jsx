import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore.js';

// Layouts
import AppLayout from './components/layout/AppLayout.jsx';

// Auth pages
import LoginPage    from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Shared pages
import DashboardPage     from './pages/DashboardPage.jsx';
import AppointmentsPage  from './pages/appointments/AppointmentsPage.jsx';
import BookAppointment   from './pages/appointments/BookAppointment.jsx';
import AppointmentDetail from './pages/appointments/AppointmentDetail.jsx';
import PatientsPage      from './pages/patients/PatientsPage.jsx';
import PatientDetail     from './pages/patients/PatientDetail.jsx';
import DoctorsPage       from './pages/doctors/DoctorsPage.jsx';
import DoctorDetail      from './pages/doctors/DoctorDetail.jsx';
import MedicalRecords    from './pages/records/MedicalRecords.jsx';
import PrescriptionsPage from './pages/prescriptions/PrescriptionsPage.jsx';
import LabOrdersPage     from './pages/lab/LabOrdersPage.jsx';
import PharmacyPage      from './pages/pharmacy/PharmacyPage.jsx';
import BillingPage       from './pages/billing/BillingPage.jsx';
import ProfilePage       from './pages/ProfilePage.jsx';
import NotFound          from './pages/NotFound.jsx';

// ─── Route guards ─────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ─── Role guard ───────────────────────────────────────────
const RoleRoute = ({ roles, children }) => {
  const user = useAuthStore((s) => s.user);
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Private (wrapped in sidebar layout) */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="profile"      element={<ProfilePage />} />

        {/* Appointments */}
        <Route path="appointments"       element={<AppointmentsPage />} />
        <Route path="appointments/book"  element={<BookAppointment />} />
        <Route path="appointments/:id"   element={<AppointmentDetail />} />

        {/* Patients — doctors, nurses, admin, receptionist */}
        <Route path="patients"    element={
          <RoleRoute roles={['admin','doctor','nurse','receptionist']}>
            <PatientsPage />
          </RoleRoute>
        } />
        <Route path="patients/:id" element={<PatientDetail />} />

        {/* Doctors */}
        <Route path="doctors"     element={<DoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />

        {/* Clinical */}
        <Route path="records"       element={<MedicalRecords />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="lab-orders"    element={<LabOrdersPage />} />

        {/* Pharmacy — pharmacist + admin */}
        <Route path="pharmacy" element={
          <RoleRoute roles={['admin','pharmacist']}>
            <PharmacyPage />
          </RoleRoute>
        } />

        {/* Billing */}
        <Route path="billing" element={<BillingPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
