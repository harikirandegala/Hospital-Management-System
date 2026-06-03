import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientApi, recordApi, appointmentApi } from '../../services/api.js';
import { format, parseISO, differenceInYears } from 'date-fns';

const STATUS_BADGE = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled' };

export default function PatientDetail() {
  const { id } = useParams();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientApi.getById(id).then((r) => r.data)
  });

  const { data: records } = useQuery({
    queryKey: ['records', id],
    queryFn: () => recordApi.byPatient(id).then((r) => r.data),
    enabled: !!id
  });

  const { data: appts } = useQuery({
    queryKey: ['appointments', 'patient', id],
    queryFn: () => appointmentApi.list({ patient_id: id, limit: 5 }).then((r) => r.data),
    enabled: !!id
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading patient…</div>;
  if (!patient)  return <div className="card text-center py-16 text-gray-500">Patient not found.</div>;

  const age = patient.dob ? differenceInYears(new Date(), parseISO(patient.dob)) : null;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 text-2xl font-bold flex-shrink-0">
          {patient.user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-gray-900">{patient.user?.name}</h1>
          <p className="text-gray-500">{patient.user?.email} · {patient.user?.phone}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {age !== null && <span className="badge bg-gray-100 text-gray-600">{age} yrs</span>}
            {patient.gender   && <span className="badge bg-gray-100 text-gray-600 capitalize">{patient.gender}</span>}
            {patient.blood_group && <span className="badge bg-red-50 text-red-600">{patient.blood_group}</span>}
          </div>
        </div>
        <Link to={`/appointments/book`} className="btn-primary flex-shrink-0">Book Appointment</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal info */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Personal Information</h2>
          <InfoRow label="Date of Birth" value={patient.dob ? format(parseISO(patient.dob),'MMM d, yyyy') : '—'} />
          <InfoRow label="Gender"        value={patient.gender || '—'} />
          <InfoRow label="Blood Group"   value={patient.blood_group || '—'} />
          <InfoRow label="Address"       value={patient.address || '—'} />
          <InfoRow label="Allergies"     value={patient.allergies?.join(', ') || 'None'} />
        </div>

        {/* Emergency + Insurance */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Emergency & Insurance</h2>
          <InfoRow label="Emergency Contact" value={patient.emergency_contact_name || '—'} />
          <InfoRow label="Emergency Phone"   value={patient.emergency_contact_phone || '—'} />
          <InfoRow label="Insurance Provider" value={patient.insurance_provider || '—'} />
          <InfoRow label="Policy Number"     value={patient.insurance_policy_no || '—'} />
        </div>
      </div>

      {/* Recent appointments */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Appointments</h2>
        {(appts?.data || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No appointments yet.</p>
        ) : (
          <table className="table-base">
            <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {(appts?.data || []).map((a) => (
                <tr key={a.id}>
                  <td>Dr. {a.doctor?.user?.name}</td>
                  <td className="text-xs font-mono">{format(parseISO(a.start_time),'MMM d, yyyy hh:mm a')}</td>
                  <td><span className={`badge capitalize ${STATUS_BADGE[a.status] || ''}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Medical records */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Medical Records</h2>
        {(records?.data || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No records yet.</p>
        ) : (
          <div className="space-y-3">
            {(records?.data || []).map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-gray-900">{r.chief_complaint || 'Visit'}</p>
                  <span className="text-xs text-gray-400">{format(parseISO(r.visit_date),'MMM d, yyyy')}</span>
                </div>
                {r.diagnosis && <p className="text-xs text-gray-600 mt-1">Dx: {r.diagnosis}</p>}
                {r.notes     && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-xs">{value}</span>
    </div>
  );
}
