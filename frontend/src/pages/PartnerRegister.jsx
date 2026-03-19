import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { FormInput, FormSelect, SubmitBtn, ErrorAlert } from '../components/AuthLayout';
import API from '../api/axios';

const CUISINES = ['Indian', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Continental', 'Fast Food', 'Desserts', 'Beverages', 'Other'];

export default function PartnerRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantName: '', handle: '', email: '', password: '', confirmPassword: '', cuisine: '', bio: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!form.cuisine) return setError('Please select a cuisine type.');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/partner/register', {
        restaurantName: form.restaurantName, handle: form.handle,
        email: form.email, password: form.password,
        cuisine: form.cuisine, bio: form.bio, location: form.location
      });
      login(data.user, data.token);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join as Food Partner 🏪"
      subtitle="Share your dishes and grow your restaurant's audience"
      footerText="Already a partner?"
      footerLink="/partner/login"
      footerLinkText="Sign in"
    >
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit}>
        <FormInput label="Restaurant Name" name="restaurantName" type="text" placeholder="e.g. La Bella Italia" value={form.restaurantName} onChange={handleChange} required />
        <FormInput label="Handle (like @username)" name="handle" type="text" placeholder="e.g. labellaItalia" value={form.handle} onChange={handleChange} required />
        <FormInput label="Business Email" name="email" type="email" placeholder="restaurant@gmail.com" value={form.email} onChange={handleChange} required />
        <FormSelect label="Cuisine Type" name="cuisine" value={form.cuisine} onChange={handleChange} required>
          <option value="">Select cuisine...</option>
          {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
        </FormSelect>
        <FormInput label="Location (optional)" name="location" type="text" placeholder="e.g. Connaught Place, Delhi" value={form.location} onChange={handleChange} />
        <FormInput label="Bio (optional)" name="bio" type="text" placeholder="Tell food lovers about your restaurant..." value={form.bio} onChange={handleChange} />
        <FormInput label="Password" name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} required />
        <FormInput label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
        <SubmitBtn loading={loading}>Register Restaurant 🚀</SubmitBtn>
      </form>
      <p className="mt-4 text-center text-xs text-gray-400">
        Food lover?{' '}
        <Link to="/register" className="text-orange-500 hover:underline">Create a user account →</Link>
      </p>
    </AuthLayout>
  );
}
