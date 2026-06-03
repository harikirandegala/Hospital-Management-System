import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '../../services/api.js';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '../../context/authStore.js';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  ordered:'badge-pending', sample_collected:'badge-confirmed',
  processing:'badge-in_progress', completed:'badge-completed', cancelled:'badge-cancelled'
};
const PRIORITY_BADGE = { routine:'bg-gray-100 text-gray-600', urgent:'bg-amber-50 text-amber-700', stat:'bg-red-50 text-red-600' };

export default function LabOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [resultModal, setResultModal] = useState(null);
  const [result, setResult] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['lab-orders', status],
    queryFn: () => labApi.list({ status, limit: 30 }).then((r) => r.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => labApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      setResultModal(null);
      setResult('');
      toast.success('Lab order updated.');
    }
  });

  const isLabTech = ['lab_tech','admin'].includes(user?.role);
  const orders = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Lab Orders</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} orders</p>
        </div>
      </div>

      <div className="card flex gap-4">
        <div className="flex-1">
          <label className="label">Filter by Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {['ordered','sample_collected','processing','completed','cancelled'].map((s) => (
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12 text-gray-400"><p className="text-3xl mb-2">🔬</p><p>No lab orders.</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Patient</th><th>Test</th><th>Priority</th><th>Ordered</th><th>Status</th><th>Result</th>{isLabTech && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-gray-800">{o.Patient?.User?.name || '—'}</td>
                  <td>
                    <p className="font-medium text-gray-800 text-sm">{o.test_name}</p>
                    <p className="text-xs text-gray-400">{o.test_type}</p>
                  </td>
                  <td><span className={`badge capitalize ${PRIORITY_BADGE[o.priority] || ''}`}>{o.priority}</span></td>
                  <td className="text-xs text-gray-500">{format(parseISO(o.ordered_at),'MMM d, yyyy')}</td>
                  <td><span className={`badge capitalize ${STATUS_BADGE[o.status] || ''}`}>{o.status.replace('_',' ')}</span></td>
                  <td className="text-xs text-gray-600 max-w-xs truncate">{o.result || '—'}</td>
                  {isLabTech && (
                    <td>
                      {o.status !== 'completed' && o.status !== 'cancelled' && (
                        <button onClick={() => setResultModal(o)} className="btn-primary text-xs py-1 px-2">
                          Enter Result
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Result modal */}
      {resultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-semibold text-gray-900 mb-1">Enter Result</h2>
            <p className="text-sm text-gray-500 mb-4">{resultModal.test_name} — {resultModal.Patient?.User?.name}</p>
            <div className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select className="input" id="modal-status" defaultValue="completed">
                  <option value="sample_collected">Sample Collected</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="label">Result</label>
                <textarea className="input resize-none" rows={4} value={result}
                  onChange={(e) => setResult(e.target.value)} placeholder="Enter test result…" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setResultModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => updateMutation.mutate({
                    id: resultModal.id,
                    status: document.getElementById('modal-status').value,
                    result
                  })}
                  disabled={updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
