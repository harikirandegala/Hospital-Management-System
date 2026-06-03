import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore.js';
import { authApi } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.register({ ...data, role: 'patient' });
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm">Join MediCore as a patient</p>
        </div>
        <div className="card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="Ravi Kumar" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" placeholder="ravi@email.com" {...register('email', { required: true })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 9876543210" {...register('phone')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" {...register('password', { required: true, minLength: 8 })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-brand-500 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
