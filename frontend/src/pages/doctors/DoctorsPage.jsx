import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { doctorApi } from '../../services/api.js';

export default function DoctorsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', search],
    queryFn: () => doctorApi.list({ search, limit: 50 }).then((r) => r.data)
  });

  const doctors = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} on staff</p>
        </div>
      </div>

      <div className="card">
        <input className="input" placeholder="Search by name or specialization…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <Link key={doc.id} to={`/doctors/${doc.id}`} className="card-hover group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-lg flex-shrink-0">
                  {doc.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">Dr. {doc.user?.name}</p>
                  <p className="text-xs text-teal-600 font-medium">{doc.specialization}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.department?.name}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">{doc.experience_years} yrs exp</span>
                <span className="text-xs font-semibold text-brand-500">₹{doc.consultation_fee}</span>
              </div>
              <div className="mt-3">
                <Link to={`/appointments/book`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary text-xs py-1.5 w-full justify-center">
                  Book
                </Link>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
