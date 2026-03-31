import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { FormInput, SubmitBtn, ErrorAlert } from '../components/AuthLayout';
import API from '../api/axios';

export default function UserLogin() {
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
      const { data } = await API.post('/auth/user/login', form);
      login(data.user, data.token);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back! 👋"
      subtitle="Log in to explore amazing food on Zwigato"
      footerText="Don't have an account?"
      footerLink="/register"
      footerLinkText="Sign up free"
    >
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit}>
        <FormInput label="Email Address" name="email" type="email" placeholder="your@gmail.com" value={form.email} onChange={handleChange} required />
        <FormInput label="Password" name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
        <SubmitBtn loading={loading}>Log In 🍽️</SubmitBtn>
      </form>
      <p className="mt-4 text-center text-xs text-gray-400">
        Are you a restaurant?{' '}
        <Link to="/partner/login" className="text-orange-500 hover:underline">Partner login →</Link>
      </p>
    </AuthLayout>
  );
}