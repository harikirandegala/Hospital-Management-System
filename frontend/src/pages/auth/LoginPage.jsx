import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore.js';
import { authApi } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
     // Demo login
  if (
    data.email === 'demo@hospital.com' &&
    data.password === 'demo123'
  ) {
    setAuth(
      {
        id: 'demo',
        name: 'Demo Admin',
        email: 'demo@hospital.com',
        role: 'admin'
      },
      'demo-token',
      'demo-refresh'
    );

    toast.success('Welcome Demo Admin!');
    navigate('/dashboard');
    setLoading(false);
    return;
  }

    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 bg-brand-400 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-display font-bold text-gray-900 text-2xl">MediCore HMS</span>
          </div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="card shadow-lg shadow-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className={`input ${errors.email ? 'border-red-300 focus:border-red-400' : ''}`}
                placeholder="doctor@hospital.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>

<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    className={`input ${errors.password ? 'border-red-300' : ''}`}
    placeholder="••••••••"
    {...register('password', { required: 'Password is required' })}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

{errors.password && (
  <p className="text-red-500 text-xs mt-1">
    {errors.password.message}
  </p>
)}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            New patient?{' '}
            <Link to="/register" className="text-brand-500 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
