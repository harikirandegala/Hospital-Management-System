import { useQuery } from '@tanstack/react-query';
import { appointmentApi, patientApi, doctorApi } from '../services/api.js';
import { useAuthStore } from '../context/authStore.js';
import { format, isToday, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const STATUS_BADGE = {
  pending:     'badge-pending',
  confirmed:   'badge-confirmed',
  completed:   'badge-completed',
  cancelled:   'badge-cancelled',
  in_progress: 'badge-in_progress',
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-display font-semibold text-gray-900 mt-1">{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: appts } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentApi.list({ date: format(new Date(), 'yyyy-MM-dd'), limit: 10 }).then((r) => r.data)
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'count'],
    queryFn: () => patientApi.list({ limit: 1 }).then((r) => r.data),
    enabled: ['admin','doctor','nurse','receptionist'].includes(user?.role)
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors', 'count'],
    queryFn: () => doctorApi.list({ limit: 1 }).then((r) => r.data),
    enabled: ['admin','receptionist'].includes(user?.role)
  });

  const todayAppts = appts?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/appointments/book" className="btn-primary">
          + Book Appointment
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={appts?.total}   icon="📅" color="bg-brand-50" />
        <StatCard label="Total Patients"        value={patients?.total} icon="🧑‍⚕️" color="bg-teal-50" />
        <StatCard label="Active Doctors"         value={doctors?.total}  icon="👨‍⚕️" color="bg-purple-50" />
        <StatCard label="Pending"
          value={todayAppts.filter((a) => a.status === 'pending').length}
          icon="⏳" color="bg-amber-50" />
      </div>

      {/* Today's appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Today's Appointments</h2>
          <Link to="/appointments" className="text-sm text-brand-500 hover:underline">View all →</Link>
        </div>

        {todayAppts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">No appointments scheduled for today</p>
            <Link to="/appointments/book" className="btn-primary mt-4 inline-flex">Book one now</Link>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {todayAppts.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-gray-800">{a.patient?.user?.name || '—'}</td>
                  <td className="text-gray-600">Dr. {a.doctor?.user?.name || '—'}</td>
                  <td className="text-gray-600 font-mono text-xs">
                    {format(parseISO(a.start_time), 'hh:mm a')}
                  </td>
                  <td>
                    <span className="badge bg-gray-100 text-gray-600">{a.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[a.status] || ''}`}>{a.status}</span>
                  </td>
                  <td>
                    <Link to={`/appointments/${a.id}`} className="btn-ghost text-xs py-1 px-2">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
