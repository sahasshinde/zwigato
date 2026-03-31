import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const TAGS_OPTIONS = ['spicy', 'vegan', 'bestseller', 'new', 'healthy', 'sweet', 'street food', 'chef special'];

const STATUS_COLORS = {
  placed: 'bg-blue-50 text-blue-600',
  confirmed: 'bg-purple-50 text-purple-600',
  preparing: 'bg-yellow-50 text-yellow-600',
  'out for delivery': 'bg-orange-50 text-orange-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled'];

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dishName: '', description: '', price: '', tags: [] });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();

  const fetchData = async () => {
  try {
    const postsRes = await API.get('/partners/profile');
    setPosts(postsRes.data.posts || []);
  } catch {}
  try {
    const ordersRes = await API.get('/orders/partner');
    setOrders(ordersRes.data.orders || []);
  } catch {}
  setLoading(false);
};

  useEffect(() => { fetchData(); }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return setError('Video must be under 50MB.');
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.dishName.trim() || !form.description.trim()) return setError('Product name and description are required.');
    setSubmitting(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('dishName', form.dishName);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('tags', JSON.stringify(form.tags));
      if (videoFile) formData.append('video', videoFile);

      const { data } = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });

      setPosts(prev => [data.post, ...prev]);
      setForm({ dishName: '', description: '', price: '', tags: [] });
      setVideoFile(null);
      setVideoPreview('');
      setShowForm(false);
      setSuccess('🎉 Post published successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Try again.');
    }
    setSubmitting(false);
    setUploadProgress(0);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch {}
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch {}
  };

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

 
  const pendingOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus)).length;
  const totalRevenue = orders.filter(o => o.orderStatus === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard 📊</h1>
            <p className="text-sm text-gray-500">Welcome back, <span className="text-orange-500 font-semibold">{user?.restaurantName}</span></p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition shadow-sm ${showForm ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            {showForm ? '✕ Cancel' : '+ New Post'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Posts', value: posts.length, icon: '🎥', color: 'bg-orange-50 border-orange-100' },
            
            { label: 'Pending Orders', value: pendingOrders, icon: '🛒', color: 'bg-blue-50 border-blue-100' },
            { label: 'Revenue', value: `₹${totalRevenue}`, icon: '💰', color: 'bg-green-50 border-green-100' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border text-center`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-xl text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {success}
          </div>
        )}

        {/* New Post Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5 text-lg">Share a New Dish 🎥</h2>
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input value={form.dishName} onChange={e => setForm({ ...form, dishName: e.target.value })}
                  placeholder="e.g. Butter Chicken, Margherita Pizza..." required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 transition" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe your dish..." required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 transition resize-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 299" type="number" min="1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 transition" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS_OPTIONS.map(tag => (
                    <button type="button" key={tag} onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${form.tags.includes(tag) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video (max 50MB)</label>
                <div onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition">
                  {videoPreview ? (
                    <div>
                      <video src={videoPreview} controls className="w-full rounded-lg max-h-48 mb-2" />
                      <p className="text-xs text-green-600 font-medium">✅ {videoFile?.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to change video</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">🎥</div>
                      <p className="text-sm font-medium text-gray-600">Click to upload a video</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WEBM — max 50MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </div>
              {submitting && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 transition">
                {submitting ? `⏳ Uploading ${uploadProgress}%...` : '🚀 Publish Post'}
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
          {[
            { key: 'posts', label: `🎥 Posts (${posts.length})` },
            { key: 'orders', label: `🛒 Orders (${orders.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === tab.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          loading ? (
            <div className="flex justify-center py-10"><div className="text-4xl animate-spin">🍽️</div></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-orange-50">
              <div className="text-5xl mb-3">🎥</div>
              <p className="text-gray-500 font-medium">No posts yet</p>
              <p className="text-sm text-gray-400 mt-1">Share your first dish video above!</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDelete} />)
          )
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-orange-50">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here when users place them!</p>
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
                        <p className="text-xs text-gray-400">by @{order.user?.username} · {timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-50 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 rounded-xl p-3 mb-3">
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
                  <p className="text-xs text-gray-400 mb-3">📍 {order.address}</p>
                  {!['delivered', 'cancelled'].includes(order.orderStatus) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Update Status:</p>
                      <div className="flex flex-wrap gap-1">
                        {ORDER_STATUSES.filter(s => s !== order.orderStatus).map(status => (
                          <button key={status} onClick={() => handleStatusUpdate(order._id, status)}
                            className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition capitalize font-medium">
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}