import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../context/authStore.js';
import { recordApi, patientApi } from '../../services/api.js';
import { format, parseISO } from 'date-fns';

export default function MedicalRecords() {
  const user = useAuthStore((s) => s.user);
  const [patientId, setPatientId] = useState('');
  const [expanded, setExpanded] = useState(null);

  const isPatient = user?.role === 'patient';

  // For non-patients: need to pick a patient first
  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => patientApi.list({ limit: 100 }).then((r) => r.data),
    enabled: !isPatient
  });

  // Resolve patientId for patients (from their own profile)
  const { data: ownPatient } = useQuery({
    queryKey: ['own-patient', user?.id],
    queryFn: () => patientApi.list({ limit: 1 }).then((r) => r.data?.data?.[0]),
    enabled: isPatient
  });

  const resolvedPid = isPatient ? ownPatient?.id : patientId;

  const { data: records, isLoading } = useQuery({
    queryKey: ['records', resolvedPid],
    queryFn: () => recordApi.byPatient(resolvedPid).then((r) => r.data),
    enabled: !!resolvedPid
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-gray-900">Medical Records</h1>

      {!isPatient && (
        <div className="card">
          <label className="label">Select Patient</label>
          <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Choose a patient…</option>
            {(patients?.data || []).map((p) => (
              <option key={p.id} value={p.id}>{p.user?.name} — {p.user?.email}</option>
            ))}
          </select>
        </div>
      )}

      {!resolvedPid ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p>Select a patient to view records.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading records…</div>
      ) : (records?.data || []).length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p>No medical records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(records?.data || []).map((r) => (
            <div key={r.id} className="card">
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full flex items-start justify-between text-left"
              >
                <div>
                  <p className="font-semibold text-gray-900">{r.chief_complaint || 'Clinical Visit'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dr. {r.Doctor?.User?.name || '—'} · {format(parseISO(r.visit_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className="text-gray-400 text-xs mt-1">{expanded === r.id ? '▲' : '▼'}</span>
              </button>

              {expanded === r.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm">
                  {r.diagnosis && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Diagnosis</p>
                      <p className="text-gray-700">{r.diagnosis}</p>
                    </div>
                  )}
                  {r.notes && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Clinical Notes</p>
                      <p className="text-gray-700">{r.notes}</p>
                    </div>
                  )}
                  {r.vitals && Object.keys(r.vitals).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Vitals</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(r.vitals).map(([k, v]) => (
                          <div key={k} className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-400 capitalize">{k.replace('_',' ')}</p>
                            <p className="font-semibold text-gray-800 text-sm">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
