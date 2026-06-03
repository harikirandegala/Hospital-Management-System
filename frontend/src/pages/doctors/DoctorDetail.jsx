import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '../../services/api.js';
import { format } from 'date-fns';

export default function DoctorDetail() {
  const { id } = useParams();
  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorApi.getById(id).then((r) => r.data)
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (!doctor)   return <div className="card text-center py-12 text-gray-500">Doctor not found.</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 text-2xl font-bold flex-shrink-0">
          {doctor.user?.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-gray-900">Dr. {doctor.user?.name}</h1>
          <p className="text-teal-600 font-medium">{doctor.specialization}</p>
          <p className="text-gray-500 text-sm">{doctor.department?.name} · {doctor.experience_years} years experience</p>
        </div>
        <Link to="/appointments/book" className="btn-primary flex-shrink-0">Book Appointment</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Credentials</h2>
          <InfoRow label="Qualification"   value={doctor.qualification || '—'} />
          <InfoRow label="License No."     value={doctor.license_number || '—'} />
          <InfoRow label="Consultation Fee" value={`₹${doctor.consultation_fee}`} />
          <InfoRow label="Slot Duration"   value={`${doctor.slot_duration_mins} mins`} />
        </div>
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Availability</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
              <span key={d} className={`badge ${doctor.available_days?.includes(d) ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-300'}`}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
