import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiEdit2, FiSave, FiGift, FiHeart, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { usersAPI, paymentsAPI } from '../services/api';

export default function ProfilePage() {
  const { user, initialize } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const avatarInputRef = useRef(null);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    state_of_residence: user?.state_of_residence || '',
    date_of_birth: user?.date_of_birth || '',
    wedding_anniversary: user?.wedding_anniversary || '',
  });

  const { data: summaryData } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: () => paymentsAPI.getSummary(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => usersAPI.update(user.id, data),
    onSuccess: () => {
      toast.success('Profile updated!');
      setEditing(false);
      initialize();
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => usersAPI.uploadAvatar(user.id, file),
    onSuccess: () => {
      toast.success('Profile picture updated!');
      initialize();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Upload failed'),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    avatarMutation.mutate(file);
  };

  const summary = summaryData?.data?.summary;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const NIGERIAN_STATES = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
    'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
    'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
    'Yobe','Zamfara',
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-outline flex items-center gap-2 text-sm">
            <FiEdit2 size={14} /> Edit
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-stoba-green group cursor-pointer"
            title="Change profile picture"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-stoba-green flex items-center justify-center text-white text-3xl font-bold">
                {user?.full_name?.charAt(0) || '?'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCamera className="text-white" size={20} />
            </div>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium capitalize ${
              user?.role === 'admin' ? 'bg-red-100 text-red-700' :
              user?.role === 'exco' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              <FiShield className="inline mr-1" size={12} />{user?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  className="input-field pl-10"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
            </div>
            <div>
              <label className="label">Phone (WhatsApp)</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  className="input-field pl-10"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            <div>
              <label className="label">State of Residence</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <select
                  className="input-field pl-10 appearance-none"
                  value={form.state_of_residence}
                  onChange={(e) => setForm({ ...form, state_of_residence: e.target.value })}
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <div className="relative">
                <FiGift className="absolute left-3 top-3 text-gray-400" />
                <input
                  className="input-field pl-10"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Wedding Anniversary</label>
              <div className="relative">
                <FiHeart className="absolute left-3 top-3 text-gray-400" />
                <input
                  className="input-field pl-10"
                  type="date"
                  value={form.wedding_anniversary}
                  onChange={(e) => setForm({ ...form, wedding_anniversary: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={updateMutation.isPending}>
                <FiSave size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMail className="text-stoba-green" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiPhone className="text-stoba-green" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{user?.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMapPin className="text-stoba-green" />
                <div>
                  <p className="text-xs text-gray-500">State</p>
                  <p className="text-sm font-medium">{user?.state_of_residence || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiShield className="text-stoba-green" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiGift className="text-stoba-green" />
                <div>
                  <p className="text-xs text-gray-500">Birthday</p>
                  <p className="text-sm font-medium">{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiHeart className="text-stoba-green" />
                <div>
                  <p className="text-xs text-gray-500">Wedding Anniversary</p>
                  <p className="text-sm font-medium">{user?.wedding_anniversary ? new Date(user.wedding_anniversary).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Summary Card */}
      <div className="card">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Payment Summary (2026)</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-xs text-gray-500">Total Due</p>
            <p className="text-xl font-bold text-stoba-green">₦{Number(summary?.total_due || 10000).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-xl font-bold text-blue-600">₦{Number(summary?.total_paid || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-xl font-bold text-orange-500">₦{Number(summary?.outstanding || 10000).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Joined Date */}
      <div className="text-center text-xs text-gray-400">
        Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' }) : '—'}
      </div>
    </div>
  );
}
