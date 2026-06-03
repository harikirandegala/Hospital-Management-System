import { useAuthStore } from '../context/authStore.js';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });

  const mutation = useMutation({
    mutationFn: (d) => api.put(`/users/${user.id}`, d),
    onSuccess: (res) => {
      setAuth({ ...user, ...res.data }, accessToken, refreshToken);
      toast.success('Profile updated.');
    },
    onError: () => toast.error('Update failed.')
  });

  const ROLE_LABELS = {
    admin:'Administrator', doctor:'Doctor', nurse:'Nurse',
    receptionist:'Receptionist', pharmacist:'Pharmacist', lab_tech:'Lab Technician', patient:'Patient'
  };

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="badge bg-brand-50 text-brand-600 mt-1">{ROLE_LABELS[user?.role] || user?.role}</span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Edit Information</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+91 9876543210" {...register('phone')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">New Password (leave blank to keep)</label>
            <input type="password" className="input" placeholder="••••••••" {...register('password')} />
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
