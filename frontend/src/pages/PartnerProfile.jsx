import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert, SuccessAlert } from '../components/AuthLayout';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); }
  });
  return position ? (
    <Marker position={position} draggable={true}
      eventHandlers={{ dragend: (e) => setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]) }}
    />
  ) : null;
}

export default function PartnerProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ restaurantName: '', bio: '', shopNo: '', buildingName: '', area: '' });
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/partners/profile').then(({ data }) => {
      setProfile(data.partner);
      setPosts(data.posts);
      setForm({
        restaurantName: data.partner.restaurantName || '',
        bio: data.partner.bio || '',
        shopNo: data.partner.shopNo || '',
        buildingName: data.partner.buildingName || '',
        area: data.partner.area || ''
      });
      if (data.partner.latitude && data.partner.longitude) {
        const coords = [data.partner.latitude, data.partner.longitude];
        setPosition(coords);
        setMapCenter(coords);
      }
    });
  }, []);

  const handleGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setMapCenter(coords);
        setLocating(false);
      },
      () => {
        setMsg({ error: 'Could not get location.', success: '' });
        setLocating(false);
      }
    );
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/partners/profile', {
        ...form,
        latitude: position ? position[0] : profile.latitude,
        longitude: position ? position[1] : profile.longitude,
        location: `${form.area}, ${form.buildingName}`
      });
      setProfile(data.partner);
      updateUser({ restaurantName: data.partner.restaurantName });
      setMsg({ error: '', success: 'Profile updated!' });
      setEditing(false);
    } catch (err) {
      setMsg({ error: err.response?.data?.message || 'Update failed.', success: '' });
    }
    setSaving(false);
  };

  if (!profile) return <div className="pt-20 flex justify-center"><div className="text-4xl animate-spin">🍽️</div></div>;

  const EMOJIS = { Indian:'🍛', Italian:'🍝', Chinese:'🥡', Japanese:'🍣', Mexican:'🌮', Continental:'🥗', 'Fast Food':'🍔', Desserts:'🍰', Beverages:'☕', Other:'🍽️' };

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl border-2 border-orange-200">
              {EMOJIS[profile.cuisine] || '🍽️'}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">{profile.restaurantName}</h2>
              <p className="text-sm text-gray-500">@{profile.handle}</p>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{profile.cuisine}</span>
            </div>
          </div>
          {profile.bio && <p className="text-sm text-gray-600 mb-3">{profile.bio}</p>}
          {profile.area && (
            <p className="text-xs text-gray-400">
              📍 {profile.shopNo && `${profile.shopNo}, `}{profile.buildingName && `${profile.buildingName}, `}{profile.area}
            </p>
          )}
          <div className="flex gap-6 text-sm mt-3">
            <div className="text-center">
              <span className="font-bold text-gray-900">{posts.length}</span>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
            
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 text-xs">(tell customers about your food)</span></label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={4} maxLength={500} placeholder="Tell customers what makes your food special..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 resize-none" />
                <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/500</p>
              </div>

              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3">Address</p>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Number</label>
                <input value={form.shopNo} onChange={e => setForm({ ...form, shopNo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input value={form.buildingName} onChange={e => setForm({ ...form, buildingName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>

              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Update Location Pin</p>
              <button type="button" onClick={handleGPS} disabled={locating}
                className="w-full mb-3 py-2.5 border-2 border-dashed border-orange-300 text-orange-500 rounded-xl text-sm font-medium hover:bg-orange-50 transition flex items-center justify-center gap-2">
                {locating ? '📡 Detecting...' : '📍 Re-detect my location'}
              </button>

              <div className="rounded-xl overflow-hidden border border-gray-200 mb-4" style={{ height: '220px' }}>
                <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }} key={mapCenter.toString()}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              {position && (
                <p className="text-xs text-green-600 mb-4 text-center">✅ Location set: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="text-sm text-gray-500 space-y-2">
              <p><span className="font-medium text-gray-700">Email:</span> {profile.email}</p>
              <p><span className="font-medium text-gray-700">Handle:</span> @{profile.handle}</p>
              <p><span className="font-medium text-gray-700">Description:</span> {profile.bio || 'No description yet'}</p>
              <p><span className="font-medium text-gray-700">Address:</span> {profile.shopNo && `${profile.shopNo}, `}{profile.buildingName && `${profile.buildingName}, `}{profile.area || 'Not set'}</p>
              <p><span className="font-medium text-gray-700">Location pin:</span> {profile.latitude ? '✅ Set' : '❌ Not set'}</p>
            </div>
          )}
        </div>

        {/* Posts */}
       {posts.length > 0 && (
  <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
    <h3 className="font-semibold text-gray-900 mb-4">Your Menu Posts ({posts.length})</h3>
    <div className="grid grid-cols-3 gap-2">
      {posts.map(post => (
        <div key={post._id} className="bg-orange-50 rounded-xl overflow-hidden border border-orange-100">
          <div className="aspect-square bg-black relative">
            {post.videoUrl ? (
              <video src={post.videoUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">{post.emoji || '🍽️'}</span>
              </div>
            )}
          </div>
          <div className="p-1.5">
            <p className="text-xs text-gray-700 font-medium line-clamp-1">{post.dishName}</p>
            {post.price && <p className="text-xs text-green-600">₹{post.price}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}