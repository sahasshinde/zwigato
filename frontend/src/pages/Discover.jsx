import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Discover() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        try {
          const { data } = await API.get(`/partners/nearby?lat=${coords.lat}&lng=${coords.lng}`);
          setPartners(data.partners);
        } catch { }
        setLoading(false);
      },
      () => {
        setLocationError('Please allow location access to see nearby restaurants.');
        setLoading(false);
      }
    );
  }, []);

  const EMOJIS = { Indian: '🍛', Italian: '🍝', Chinese: '🥡', Japanese: '🍣', Mexican: '🌮', Continental: '🥗', 'Fast Food': '🍔', Desserts: '🍰', Beverages: '☕', Other: '🍽️' };

  if (loading) return (
    <div className="pt-20 flex flex-col items-center justify-center min-h-screen">
      <div className="text-4xl animate-spin mb-3">🍽️</div>
      <p className="text-gray-400 text-sm">Finding restaurants near you...</p>
    </div>
  );

  if (locationError) return (
    <div className="pt-20 flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-5xl mb-4">📍</div>
      <h3 className="font-bold text-gray-800 text-lg mb-2">Location Required</h3>
      <p className="text-gray-500 text-sm text-center">{locationError}</p>
    </div>
  );

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      {/* Map */}
      {userCoords && (
        <div style={{ height: '280px' }} className="w-full">
          <MapContainer center={[userCoords.lat, userCoords.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {/* User marker */}
            <Marker position={[userCoords.lat, userCoords.lng]}
              icon={L.divIcon({ className: '', html: '<div style="background:#f97316;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>' })}>
              <Popup>You are here</Popup>
            </Marker>
            {/* Restaurant markers */}
            {partners.map(p => (
              p.latitude && p.longitude && (
                <Marker key={p._id} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-sm">{p.restaurantName}</p>
                      <p className="text-xs text-gray-500">{p.cuisine}</p>
                      <p className="text-xs text-orange-500">{p.distance?.toFixed(1)} km away</p>
                      <button onClick={() => navigate(`/restaurant/${p.handle}`)}
                        className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                        View Menu
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      )}

      {/* Restaurant List */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        <h1 className="font-display text-xl font-bold text-gray-900 mb-1">🏠 Home</h1>
        <p className="text-sm text-gray-500 mb-4">
          {partners.length > 0 ? `${partners.length} restaurant${partners.length > 1 ? 's' : ''} within 5km` : 'No restaurants found within 5km'}
        </p>

        {partners.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-gray-500 text-sm">No restaurants near you yet.</p>
            <p className="text-gray-400 text-xs mt-1">Check back later!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {partners.map(p => (
              <div key={p._id}
                onClick={() => navigate(`/restaurant/${p.handle}`)}
                className="bg-white rounded-2xl p-4 border border-orange-50 shadow-sm hover:shadow-md transition cursor-pointer active:scale-95">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl border-2 border-orange-200">
                    {EMOJIS[p.cuisine] || '🍽️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-gray-900">{p.restaurantName}</span>
                      {p.isVerified && <span className="text-blue-500 text-xs">✓</span>}
                    </div>
                    <span className="text-xs text-gray-400">@{p.handle}</span>
                  </div>
                </div>
                {p.bio && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.bio}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">🍽️ {p.cuisine}</span>
                  <span className="text-xs font-semibold text-orange-500">📍 {p.distance?.toFixed(1)} km</span>
                </div>
                {p.area && <p className="text-xs text-gray-400 mt-1">📍 {p.area}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}