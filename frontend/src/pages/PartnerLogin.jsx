import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { FormInput, SubmitBtn, ErrorAlert } from '../components/AuthLayout';
import API from '../api/axios';

export default function PartnerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/partner/login', form);
      login(data.user, data.token);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Partner Sign In 🏪"
      subtitle="Welcome back! Manage your restaurant on Zwigato"
      footerText="Not registered yet?"
      footerLink="/partner/register"
      footerLinkText="Join as Food Partner"
    >
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit}>
        <FormInput label="Business Email" name="email" type="email" placeholder="restaurant@gmail.com" value={form.email} onChange={handleChange} required />
        <FormInput label="Password" name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
        <SubmitBtn loading={loading}>Sign In 🍽️</SubmitBtn>
      </form>
      <p className="mt-4 text-center text-xs text-gray-400">
        Food lover?{' '}
        <Link to="/login" className="text-orange-500 hover:underline">User login →</Link>
      </p>
    </AuthLayout>
  );
}
