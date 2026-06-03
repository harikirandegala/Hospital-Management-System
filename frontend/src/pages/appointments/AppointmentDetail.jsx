import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '../../services/api.js';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '../../context/authStore.js';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:'badge-pending', confirmed:'badge-confirmed',
  completed:'badge-completed', cancelled:'badge-cancelled', in_progress:'badge-in_progress'
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: appt, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentApi.getById(id).then((r) => r.data)
  });

  const updateMutation = useMutation({
    mutationFn: (d) => appointmentApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointment', id] }); toast.success('Updated.'); }
  });

  const cancelMutation = useMutation({
    mutationFn: () => appointmentApi.cancel(id, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointment', id] }); toast.success('Appointment cancelled.'); }
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (!appt) return <div className="card text-center py-12">Appointment not found.</div>;

  const canModify = !['cancelled','completed'].includes(appt.status);
  const isDoctor  = user?.role === 'doctor';
  const isAdmin   = ['admin','receptionist','nurse'].includes(user?.role);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/appointments" className="btn-ghost text-sm">← Back</Link>
        <span className={`badge capitalize ${STATUS_BADGE[appt.status] || ''}`}>{appt.status}</span>
      </div>

      <h1 className="text-2xl font-display font-bold text-gray-900">Appointment Details</h1>

      <div className="card space-y-4">
        <Row label="Patient"   value={appt.patient?.user?.name} />
        <Row label="Doctor"    value={`Dr. ${appt.doctor?.user?.name}`} />
        <Row label="Date"      value={format(parseISO(appt.start_time),'EEEE, MMMM d yyyy')} />
        <Row label="Time"      value={`${format(parseISO(appt.start_time),'hh:mm a')} – ${format(parseISO(appt.end_time),'hh:mm a')}`} />
        <Row label="Type"      value={appt.type === 'in_person' ? '🏥 In-person' : '💻 Telemedicine'} />
        <Row label="Reason"    value={appt.reason || '—'} />
        {appt.notes && <Row label="Notes" value={appt.notes} />}
        {appt.cancellation_reason && (
          <div className="p-3 rounded-xl bg-red-50 text-sm text-red-700">
            Cancellation reason: {appt.cancellation_reason}
          </div>
        )}
      </div>

      {/* Status actions for doctors/admin */}
      {canModify && (isDoctor || isAdmin) && (
        <div className="card">
          <p className="font-semibold text-gray-900 text-sm mb-3">Update Status</p>
          <div className="flex gap-2 flex-wrap">
            {appt.status === 'pending' && (
              <button onClick={() => updateMutation.mutate({ status: 'confirmed' })} className="btn-primary text-sm">
                ✓ Confirm
              </button>
            )}
            {appt.status === 'confirmed' && (
              <button onClick={() => updateMutation.mutate({ status: 'in_progress' })} className="btn-primary text-sm">
                ▶ Start
              </button>
            )}
            {appt.status === 'in_progress' && (
              <button onClick={() => updateMutation.mutate({ status: 'completed' })} className="btn-primary text-sm">
                ✓ Complete
              </button>
            )}
            <button onClick={() => cancelMutation.mutate()} className="btn-danger text-sm">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to={`/patients/${appt.patient_id}`} className="card-hover text-center py-4">
          <p className="text-2xl mb-1">🧑‍⚕️</p>
          <p className="text-sm font-medium text-gray-700">Patient Profile</p>
        </Link>
        <Link to="/records" className="card-hover text-center py-4">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm font-medium text-gray-700">Medical Records</p>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
