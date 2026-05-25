import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import toast from 'react-hot-toast';

const INITIAL = {
  companyName: 'Vishwa Construction',
  contractorName: 'Rashminkumar R Patel',
  pan: 'BMVPP3612B',
  mobile: '',
  email: '',
  address: 'A-19, Avdhoot Nagar Society-1,\nBholav, Bharuch-392001',
  password: '',
  confirmPassword: ''
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be under 2MB');
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { companyName, contractorName, pan, mobile, email, address, password, confirmPassword } = form;
    if (!companyName || !contractorName || !pan || !mobile || !email || !address || !password)
      return toast.error('Please fill all required fields');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await signup({ companyName, contractorName, pan, mobile, email, address, password, logo: logoPreview });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Set up your contractor profile</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo Upload */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden flex-shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Company Logo</p>
            <label className="mt-1 inline-block cursor-pointer text-xs text-primary-600 font-medium hover:underline">
              Upload Logo (optional)
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Company Name *</label>
            <input className="form-input" value={form.companyName} onChange={set('companyName')} placeholder="Vishwa Construction" />
          </div>
          <div>
            <label className="form-label">Contractor Name *</label>
            <input className="form-input" value={form.contractorName} onChange={set('contractorName')} placeholder="Your full name" />
          </div>
          <div>
            <label className="form-label">PAN Number *</label>
            <input className="form-input uppercase" value={form.pan} onChange={set('pan')} placeholder="ABCDE1234F" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Mobile Number *</label>
            <input className="form-input" type="tel" value={form.mobile} onChange={set('mobile')} placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>

        <div>
          <label className="form-label">Address *</label>
          <textarea className="form-input" rows={2} value={form.address} onChange={set('address')} placeholder="Company address" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-4">
        Already registered?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
      </p>
    </AuthLayout>
  );
}
