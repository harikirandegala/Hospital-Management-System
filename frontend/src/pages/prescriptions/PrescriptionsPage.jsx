import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../context/authStore.js';
import { patientApi } from '../../services/api.js';
import api from '../../services/api.js';
import { format, parseISO } from 'date-fns';

const STATUS_BADGE = { issued:'badge-pending', dispensed:'badge-completed', cancelled:'badge-cancelled' };

export default function PrescriptionsPage() {
  const user = useAuthStore((s) => s.user);
  const [patientId, setPatientId] = useState('');
  const isPatient = user?.role === 'patient';

  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientApi.list({ limit: 100 }).then((r) => r.data),
    enabled: !isPatient
  });
  const { data: ownPatient } = useQuery({
    queryKey: ['own-patient', user?.id],
    queryFn: () => patientApi.list({ limit: 1 }).then((r) => r.data?.data?.[0]),
    enabled: isPatient
  });

  const resolvedPid = isPatient ? ownPatient?.id : patientId;

  const { data: rxData, isLoading } = useQuery({
    queryKey: ['prescriptions', resolvedPid],
    queryFn: () => api.get(`/prescriptions/patient/${resolvedPid}`).then((r) => r.data),
    enabled: !!resolvedPid
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-gray-900">Prescriptions</h1>

      {!isPatient && (
        <div className="card">
          <label className="label">Select Patient</label>
          <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Choose a patient…</option>
            {(patients?.data || []).map((p) => (
              <option key={p.id} value={p.id}>{p.user?.name}</option>
            ))}
          </select>
        </div>
      )}

      {!resolvedPid ? (
        <div className="card text-center py-12 text-gray-400"><p className="text-3xl mb-2">💊</p><p>Select a patient.</p></div>
      ) : isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (rxData?.data || []).length === 0 ? (
        <div className="card text-center py-12 text-gray-400"><p className="text-3xl mb-2">💊</p><p>No prescriptions found.</p></div>
      ) : (
        <div className="space-y-4">
          {(rxData?.data || []).map((rx) => (
            <div key={rx.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Dr. {rx.Doctor?.User?.name || '—'} · {format(parseISO(rx.created_at),'MMM d, yyyy')}</p>
                </div>
                <span className={`badge capitalize ${STATUS_BADGE[rx.status] || ''}`}>{rx.status}</span>
              </div>
              <div className="space-y-2">
                {(rx.items || []).map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.name || item.medicine_name}</p>
                      <p className="text-xs text-gray-500">{item.dosage} · {item.frequency} · {item.duration}</p>
                      {item.instructions && <p className="text-xs text-gray-400 mt-0.5">{item.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {rx.notes && <p className="text-xs text-gray-500 mt-3 italic">{rx.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
