import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { appointmentApi } from '../../services/api.js';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:     'badge-pending',
  confirmed:   'badge-confirmed',
  completed:   'badge-completed',
  cancelled:   'badge-cancelled',
  in_progress: 'badge-in_progress',
};

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ status: '', date: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', filters, page],
    queryFn: () => appointmentApi.list({ ...filters, page, limit: 15 }).then((r) => r.data)
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => appointmentApi.cancel(id, { reason: 'Cancelled by user' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled.');
    }
  });

  const appointments = data?.data || [];
  const totalPages   = Math.ceil((data?.total || 0) / 15);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} total</p>
        </div>
        <Link to="/appointments/book" className="btn-primary">+ Book Appointment</Link>
      </div>

      {/* Filters */}
      <div className="card flex gap-4">
        <div className="flex-1">
          <label className="label">Status</label>
          <select className="input" value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            {['pending','confirmed','in_progress','completed','cancelled','no_show'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Date</label>
          <input type="date" className="input" value={filters.date}
            onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
        </div>
        <div className="flex items-end">
          <button onClick={() => setFilters({ status: '', date: '' })} className="btn-secondary">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p>No appointments found.</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-gray-800">{a.patient?.user?.name || '—'}</td>
                  <td className="text-gray-600">Dr. {a.doctor?.user?.name || '—'}</td>
                  <td className="text-gray-600 text-xs">
                    {format(parseISO(a.start_time), 'MMM d, yyyy')}
                    <span className="font-mono ml-1">{format(parseISO(a.start_time), 'hh:mm a')}</span>
                  </td>
                  <td>
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{a.type}</span>
                  </td>
                  <td>
                    <span className={`badge capitalize ${STATUS_BADGE[a.status] || ''}`}>{a.status}</span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Link to={`/appointments/${a.id}`} className="btn-ghost text-xs py-1 px-2">View</Link>
                      {!['cancelled','completed'].includes(a.status) && (
                        <button
                          onClick={() => cancelMutation.mutate(a.id)}
                          className="btn-danger text-xs py-1 px-2"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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
