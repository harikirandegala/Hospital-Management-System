import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { medicineApi } from '../../services/api.js';
import toast from 'react-hot-toast';

const DOSAGE_COLORS = { tablet:'bg-blue-50 text-blue-600', capsule:'bg-purple-50 text-purple-600',
  syrup:'bg-teal-50 text-teal-600', injection:'bg-red-50 text-red-600',
  cream:'bg-amber-50 text-amber-600', drops:'bg-green-50 text-green-600',
  inhaler:'bg-orange-50 text-orange-600', other:'bg-gray-50 text-gray-600' };

export default function PharmacyPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['medicines', search],
    queryFn: () => medicineApi.list({ search, limit: 50 }).then((r) => r.data)
  });

  const addMutation = useMutation({
    mutationFn: (d) => medicineApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine added.');
      setShowAdd(false);
      reset();
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed.')
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock_qty }) => medicineApi.update(id, { stock_qty }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicines'] }); toast.success('Stock updated.'); }
  });

  const medicines = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Pharmacy Inventory</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} medicines</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Medicine</button>
      </div>

      <div className="card">
        <input className="input" placeholder="Search medicines…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Low stock warning */}
      {medicines.some((m) => m.stock_qty <= m.reorder_level) && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm">
          ⚠️ {medicines.filter((m) => m.stock_qty <= m.reorder_level).length} medicines are at or below reorder level.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Medicine</th><th>Form</th><th>Strength</th><th>Stock</th><th>Reorder At</th><th>Expiry</th><th></th></tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td>
                    <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                    {m.generic_name && <p className="text-xs text-gray-400">{m.generic_name}</p>}
                  </td>
                  <td>
                    <span className={`badge capitalize ${DOSAGE_COLORS[m.dosage_form] || 'bg-gray-100 text-gray-600'}`}>
                      {m.dosage_form}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600">{m.strength || '—'}</td>
                  <td>
                    <span className={`font-semibold text-sm ${m.stock_qty <= m.reorder_level ? 'text-red-500' : 'text-gray-900'}`}>
                      {m.stock_qty}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">{m.reorder_level}</td>
                  <td className="text-xs text-gray-500">{m.expiry_date || '—'}</td>
                  <td>
                    <input
                      type="number"
                      defaultValue={m.stock_qty}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (val !== m.stock_qty) stockMutation.mutate({ id: m.id, stock_qty: val });
                      }}
                      className="w-20 text-center text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add medicine modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-semibold text-gray-900 mb-4">Add New Medicine</h2>
            <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="space-y-3">
              <div><label className="label">Name *</label><input className="input" {...register('name', { required: true })} /></div>
              <div><label className="label">Generic Name</label><input className="input" {...register('generic_name')} /></div>
              <div><label className="label">Category</label><input className="input" {...register('category')} /></div>
              <div>
                <label className="label">Dosage Form</label>
                <select className="input" {...register('dosage_form')}>
                  {['tablet','capsule','syrup','injection','cream','drops','inhaler','other'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div><label className="label">Strength</label><input className="input" placeholder="e.g. 500mg" {...register('strength')} /></div>
              <div><label className="label">Stock Quantity</label><input type="number" className="input" defaultValue={0} {...register('stock_qty')} /></div>
              <div><label className="label">Unit Price (₹)</label><input type="number" step="0.01" className="input" {...register('unit_price')} /></div>
              <div><label className="label">Expiry Date</label><input type="date" className="input" {...register('expiry_date')} /></div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={addMutation.isPending} className="btn-primary flex-1">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
