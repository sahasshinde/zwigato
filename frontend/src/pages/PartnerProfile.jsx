import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert, SuccessAlert } from '../components/AuthLayout';

export default function PartnerProfile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ restaurantName: '', bio: '', location: '' });
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    API.get('/partners/profile').then(({ data }) => {
      setPartner(data.partner);
      setForm({ restaurantName: data.partner.restaurantName, bio: data.partner.bio || '', location: data.partner.location || '' });
    });
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/partners/profile', form);
      setPartner(data.partner);
      updateUser({ restaurantName: data.partner.restaurantName, bio: data.partner.bio });
      setMsg({ error: '', success: 'Profile updated!' });
      setEditing(false);
    } catch (err) {
      setMsg({ error: err.response?.data?.message || 'Update failed.', success: '' });
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your restaurant account? All posts and videos will be permanently deleted!')) return;
    setDeleting(true);
    try {
      await API.delete('/partners/delete');
      logout();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting account.');
    }
    setDeleting(false);
  };

  if (!partner) return (
    <div className="pt-20 flex justify-center min-h-screen bg-gray-50">
      <div className="text-4xl animate-spin mt-20">🍽️</div>
    </div>
  );

  const CUISINE_EMOJI = {
    Indian: '🍛', Italian: '🍝', Chinese: '🥡', Japanese: '🍣',
    Mexican: '🌮', Continental: '🥗', 'Fast Food': '🍔',
    Desserts: '🍰', Beverages: '☕', Other: '🍽️'
  };

  const emoji = CUISINE_EMOJI[partner.cuisine] || '🏪';

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Partner card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-3xl">
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-gray-900">{partner.restaurantName}</h2>
                {partner.isVerified && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-sm text-gray-500">@{partner.handle}</p>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{partner.cuisine}</span>
            </div>
          </div>
          {partner.bio && <p className="text-sm text-gray-600 mb-2">{partner.bio}</p>}
          {partner.location && <p className="text-xs text-gray-400 mb-3">📍 {partner.location}</p>}
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <span className="font-bold text-gray-900">{partner.followers?.length || 0}</span>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Edit Profile</h3>
            <button onClick={() => setEditing(!editing)} className="text-sm text-orange-500 hover:underline">
              {editing ? 'Cancel' : 'Edit ✏️'}
            </button>
          </div>
          {msg.error && <ErrorAlert message={msg.error} />}
          {msg.success && <SuccessAlert message={msg.success} />}
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Bandra, Mumbai"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3} placeholder="Tell food lovers about your restaurant..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 resize-none" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="text-sm text-gray-500 space-y-2">
              <p><span className="font-medium text-gray-700">Email:</span> {partner.email}</p>
              <p><span className="font-medium text-gray-700">Handle:</span> @{partner.handle}</p>
              <p><span className="font-medium text-gray-700">Cuisine:</span> {partner.cuisine}</p>
              <p><span className="font-medium text-gray-700">Location:</span> {partner.location || 'Not set'}</p>
              <p><span className="font-medium text-gray-700">Bio:</span> {partner.bio || 'No bio yet'}</p>
            </div>
          )}

          {/* Delete Account */}
          <div className="mt-6 pt-4 border-t border-red-100">
            <h4 className="text-sm font-semibold text-red-500 mb-2">Danger Zone</h4>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-500 hover:text-white disabled:opacity-60 transition"
            >
              {deleting ? '⏳ Deleting...' : '🗑️ Delete Restaurant Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}