import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../../services/api.js';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '../../context/authStore.js';

const STATUS_BADGE = {
  draft:'bg-gray-100 text-gray-600', issued:'badge-pending',
  paid:'badge-completed', partially_paid:'badge-confirmed',
  overdue:'badge-cancelled', cancelled:'badge-cancelled'
};

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', status],
    queryFn: () => invoiceApi.list({ status, limit: 30 }).then((r) => r.data)
  });

  const invoices = data?.data || [];
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0);
  const totalPending = invoices.filter((i) => i.status === 'issued').reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} invoices</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total Revenue</p>
          <p className="text-2xl font-display font-semibold text-teal-600 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pending</p>
          <p className="text-2xl font-display font-semibold text-amber-600 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Invoices</p>
          <p className="text-2xl font-display font-semibold text-gray-900 mt-1">{data?.total || 0}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <label className="label">Filter by Status</label>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {['draft','issued','paid','partially_paid','overdue','cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">💳</p><p>No invoices found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Invoice #</th><th>Patient</th><th>Date</th><th>Total</th><th>Insurance</th><th>Status</th></tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-gray-600">{inv.invoice_number}</td>
                  <td className="font-medium text-gray-800">{inv.Patient?.User?.name || '—'}</td>
                  <td className="text-xs text-gray-500">{format(parseISO(inv.created_at),'MMM d, yyyy')}</td>
                  <td className="font-semibold text-gray-900">₹{Number(inv.total).toLocaleString()}</td>
                  <td className="text-xs">
                    {inv.insurance_claimed
                      ? <span className="text-teal-600">₹{Number(inv.insurance_amount).toLocaleString()}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td>
                    <span className={`badge capitalize ${STATUS_BADGE[inv.status] || ''}`}>{inv.status.replace('_',' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
