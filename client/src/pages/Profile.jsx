import { useState, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const logoRef = useRef();
  const sigRef = useRef();

  const [form, setForm] = useState({
    companyName: user?.companyName || '',
    contractorName: user?.contractorName || '',
    pan: user?.pan || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    address: user?.address || '',
    logo: user?.logo || null,
    signature: user?.signature || null,
    darkMode: user?.darkMode || false,
    gstEnabled: user?.gstEnabled || false,
    gstNumber: user?.gstNumber || '',
    categoryOfService: user?.categoryOfService || 'Civil Construction Work'
  });

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const setPass = (field) => (e) => setPassForm(p => ({ ...p, [field]: e.target.value }));

  const handleImageUpload = (field, ref) => {
    const file = ref.current.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error(`${field} must be under 2MB`);
    const reader = new FileReader();
    reader.onload = (ev) => setForm(p => ({ ...p, [field]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileService.update(form);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) return toast.error('Please fill all fields');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSaving(true);
    try {
      await profileService.updatePassword(passForm.currentPassword, passForm.newPassword);
      toast.success('Password changed! Please log in again.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = ['profile', 'appearance', 'security'];

  return (
    <MainLayout>
      <h2 className="page-title mb-6">Profile Settings</h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-5">
          {/* Logo & Signature */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Images</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="form-label">Company Logo</label>
                <div
                  onClick={() => logoRef.current.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden"
                >
                  {form.logo ? (
                    <img src={form.logo} alt="logo" className="max-h-24 max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400 p-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mx-auto mb-1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <span className="text-xs">Click to upload</span>
                    </div>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={() => handleImageUpload('logo', logoRef)} />
                {form.logo && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, logo: null }))} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                )}
              </div>

              {/* Signature */}
              <div>
                <label className="form-label">Signature</label>
                <div
                  onClick={() => sigRef.current.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden"
                >
                  {form.signature ? (
                    <img src={form.signature} alt="signature" className="max-h-24 max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400 p-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mx-auto mb-1">
                        <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                        <path d="M2 2l7.586 7.586"/>
                      </svg>
                      <span className="text-xs">Click to upload</span>
                    </div>
                  )}
                </div>
                <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={() => handleImageUpload('signature', sigRef)} />
                {form.signature && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, signature: null }))} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Company Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Company Name *</label>
                <input className="form-input" value={form.companyName} onChange={set('companyName')} />
              </div>
              <div>
                <label className="form-label">Contractor Name *</label>
                <input className="form-input" value={form.contractorName} onChange={set('contractorName')} />
              </div>
              <div>
                <label className="form-label">PAN Number *</label>
                <input className="form-input uppercase" value={form.pan} onChange={set('pan')} maxLength={10} />
              </div>
              <div>
                <label className="form-label">Mobile *</label>
                <input className="form-input" type="tel" value={form.mobile} onChange={set('mobile')} />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={set('email')} />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Address *</label>
                <textarea className="form-input" rows={3} value={form.address} onChange={set('address')} />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Default Category of Service</label>
                <input className="form-input" value={form.categoryOfService} onChange={set('categoryOfService')} placeholder="Civil Construction Work" />
              </div>
            </div>
          </div>

          {/* GST Settings */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">GST Settings</h3>
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.gstEnabled} onChange={e => setForm(p => ({ ...p, gstEnabled: e.target.checked }))} />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Enable GST by default</span>
            </div>
            {form.gstEnabled && (
              <div>
                <label className="form-label">GST Number</label>
                <input className="form-input" value={form.gstNumber} onChange={set('gstNumber')} placeholder="GSTIN number" />
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Appearance Tab */}
      {tab === 'appearance' && (
        <div className="max-w-md">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Theme</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Switch to dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.darkMode}
                  onChange={async (e) => {
                    const newVal = e.target.checked;
                    setForm(p => ({ ...p, darkMode: newVal }));
                    try {
                      const res = await profileService.update({ ...form, darkMode: newVal });
                      updateUser(res.data.data);
                    } catch { toast.error('Failed to update theme'); }
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="max-w-md">
          <form onSubmit={handleChangePassword} className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passForm.currentPassword} onChange={setPass('currentPassword')} placeholder="Enter current password" />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passForm.newPassword} onChange={setPass('newPassword')} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={passForm.confirmPassword} onChange={setPass('confirmPassword')} placeholder="Repeat new password" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-3">
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>

          <div className="mt-5 card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Log out from this device</p>
            <button onClick={logout} className="btn-danger w-full py-3 justify-center bg-red-600 hover:bg-red-700 text-white">
              Logout
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
