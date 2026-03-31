import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { FormInput, SubmitBtn, ErrorAlert } from '../components/AuthLayout';
import API from '../api/axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return position ? <Marker position={position} draggable={true}
    eventHandlers={{ dragend: (e) => setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]) }}
  /> : null;
}

export default function PartnerRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    restaurantName: '', handle: '', email: '', password: '',
    cuisine: '', bio: '', shopNo: '', buildingName: '', area: ''
  });
  const [position, setPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center default

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

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
        setError('Could not get location. Please pin manually on map.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!position) return setError('Please set your restaurant location on the map.');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/partner/register', {
        ...form,
        latitude: position[0],
        longitude: position[1],
        location: `${form.area}, ${form.buildingName}`
      });
      login(data.partner, data.token);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const CUISINES = ['Indian','Italian','Chinese','Japanese','Mexican','Continental','Fast Food','Desserts','Beverages','Other'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl">🏪</span>
          <h1 className="font-display text-2xl font-bold text-gray-900 mt-2">Register your Restaurant</h1>
          <p className="text-sm text-gray-500 mt-1">Join Zwigato as a food partner</p>
        </div>

        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
          <ErrorAlert message={error} />
          <form onSubmit={handleSubmit}>

            {/* Restaurant Info */}
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3">Restaurant Info</p>
            <FormInput label="Restaurant Name" name="restaurantName" placeholder="Spice Route" value={form.restaurantName} onChange={handleChange} required />
            <FormInput label="Handle (username)" name="handle" placeholder="spice_route" value={form.handle} onChange={handleChange} required />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
              <select name="cuisine" value={form.cuisine} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400">
                <option value="">Select cuisine...</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Address */}
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3 mt-4">Restaurant Address</p>
            <FormInput label="Shop Number" name="shopNo" placeholder="Shop 4" value={form.shopNo} onChange={handleChange} required />
            <FormInput label="Building Name" name="buildingName" placeholder="Sunshine Mall" value={form.buildingName} onChange={handleChange} required />
            <FormInput label="Area" name="area" placeholder="Bandra, Mumbai" value={form.area} onChange={handleChange} required />

            {/* Map */}
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2 mt-4">Pin Your Location on Map</p>
            <p className="text-xs text-gray-400 mb-3">This helps customers find you. Click the button to auto-detect or click on the map to place pin manually.</p>

            <button type="button" onClick={handleGPS} disabled={locating}
              className="w-full mb-3 py-2.5 border-2 border-dashed border-orange-300 text-orange-500 rounded-xl text-sm font-medium hover:bg-orange-50 transition flex items-center justify-center gap-2">
              {locating ? '📡 Detecting...' : '📍 Auto-detect my location'}
            </button>

            <div className="rounded-xl overflow-hidden border border-gray-200 mb-4" style={{ height: '250px' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} key={mapCenter.toString()}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            {position && (
              <p className="text-xs text-green-600 mb-4 text-center">
                ✅ Location set: {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </p>
            )}

            {/* Account */}
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3 mt-2">Account Details</p>
            <FormInput label="Email Address" name="email" type="email" placeholder="restaurant@gmail.com" value={form.email} onChange={handleChange} required />
            <FormInput label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />

            <SubmitBtn loading={loading}>Register Restaurant 🏪</SubmitBtn>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Already registered?{' '}
            <Link to="/partner/login" className="text-orange-500 hover:underline">Login here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}