import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert, SuccessAlert } from '../components/AuthLayout';

const STATUS_COLORS = {
  placed: 'bg-blue-50 text-blue-600',
  confirmed: 'bg-purple-50 text-purple-600',
  preparing: 'bg-yellow-50 text-yellow-600',
  'out for delivery': 'bg-orange-50 text-orange-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '' });
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    API.get('/users/profile').then(({ data }) => {
      setProfile(data.user);
      setForm({ name: data.user.name, bio: data.user.bio || '' });
    });
    API.get('/orders/my').then(({ data }) => {
      setOrders(data.orders || []);
    }).catch(() => {});
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', form);
      setProfile(data.user);
      updateUser({ name: data.user.name, bio: data.user.bio });
      setMsg({ error: '', success: 'Profile updated!' });
      setEditing(false);
    } catch (err) {
      setMsg({ error: err.response?.data?.message || 'Update failed.', success: '' });
    }
    setSaving(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(orderId);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    }
    setCancelling(null);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone!')) return;
    setDeleting(true);
    try {
      await API.delete('/users/delete');
      logout();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting account.');
    }
    setDeleting(false);
  };

  if (!profile) return (
    <div className="pt-20 flex justify-center min-h-screen bg-gray-50">
      <div className="text-4xl animate-spin mt-20">🍽️</div>
    </div>
  );

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl border-2 border-orange-200">
              😋
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Food Lover</span>
            </div>
          </div>
          {profile.bio && <p className="text-sm text-gray-600 mb-3">{profile.bio}</p>}
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <span className="font-bold text-gray-900">{profile.following?.length || 0}</span>
              <p className="text-xs text-gray-400">Following</p>
            </div>
            <div className="text-center">
              <span className="font-bold text-gray-900">{orders.length}</span>
              <p className="text-xs text-gray-400">Orders</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
          {[
            { key: 'profile', label: '👤 Profile' },
            { key: 'orders', label: '🛒 My Orders' },
            { key: 'following', label: '👥 Following' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${activeTab === tab.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={3} placeholder="Tell others about yourself..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 resize-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="text-sm text-gray-500 space-y-2">
                <p><span className="font-medium text-gray-700">Email:</span> {profile.email}</p>
                <p><span className="font-medium text-gray-700">Username:</span> @{profile.username}</p>
                <p><span className="font-medium text-gray-700">Bio:</span> {profile.bio || 'No bio yet'}</p>
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
                {deleting ? '⏳ Deleting...' : '🗑️ Delete My Account'}
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-orange-50">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">Order something delicious from the feed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-2xl border border-orange-50 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl border border-orange-100">
                          {order.emoji || '🍽️'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{order.dishName}</p>
                          <p className="text-xs text-gray-400">{order.partner?.restaurantName}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-50 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 mb-3">
                      <div>
                        <p className="text-gray-400">Qty</p>
                        <p className="font-semibold text-gray-800">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-semibold text-green-600">₹{order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment</p>
                        <p className="font-semibold text-gray-800">{order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">📍 {order.address}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
                      </div>
                      {order.orderStatus === 'placed' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancelling === order._id}
                          className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-full hover:bg-red-50 disabled:opacity-50 transition"
                        >
                          {cancelling === order._id ? '⏳ Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Following ({profile.following?.length || 0})</h3>
            {profile.following?.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-400 text-sm">Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.following?.map(p => (
                  <div key={p._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg">🏪</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.restaurantName}</p>
                      <p className="text-xs text-gray-400">@{p.handle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}