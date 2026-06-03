import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientApi } from '../../services/api.js';
import { differenceInYears, parseISO } from 'date-fns';

const BLOOD_COLORS = {
  'A+':'bg-red-50 text-red-600','A-':'bg-red-50 text-red-700',
  'B+':'bg-orange-50 text-orange-600','B-':'bg-orange-50 text-orange-700',
  'AB+':'bg-purple-50 text-purple-600','O+':'bg-blue-50 text-blue-600',
};

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: () => patientApi.list({ search, page, limit: 15 }).then((r) => r.data),
    keepPreviousData: true
  });

  const patients   = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / 15);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} registered</p>
        </div>
        <Link to="/appointments/book" className="btn-primary">+ Book Appointment</Link>
      </div>

      <div className="card">
        <input className="input" placeholder="Search by name, email or phone…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : patients.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🧑‍⚕️</p>
          <p>No patients found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((p) => {
            const age = p.dob ? differenceInYears(new Date(), parseISO(p.dob)) : null;
            return (
              <Link key={p.id} to={`/patients/${p.id}`} className="card-hover group">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm flex-shrink-0">
                    {p.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {age !== null && <span className="badge bg-gray-100 text-gray-600">{age} yrs</span>}
                      {p.gender && <span className="badge bg-gray-100 text-gray-600 capitalize">{p.gender}</span>}
                      {p.blood_group && <span className={`badge ${BLOOD_COLORS[p.blood_group] || 'bg-gray-100 text-gray-500'}`}>{p.blood_group}</span>}
                    </div>
                  </div>
                </div>
                {p.user?.phone && <p className="text-xs text-gray-400 mt-3">📞 {p.user.phone}</p>}
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-3">←</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn-secondary px-3">→</button>
        </div>
      )}
    </div>
  );
}
