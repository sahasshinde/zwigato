import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { FormInput, SubmitBtn, ErrorAlert } from '../components/AuthLayout';
import API from '../api/axios';

export default function UserRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/user/register', {
        name: form.name, username: form.username, email: form.email, password: form.password
      });
      login(data.user, data.token);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Zwigato and discover amazing food 🍽️"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log in"
    >
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit}>
        <FormInput label="Full Name" name="name" type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={handleChange} required />
        <FormInput label="Username" name="username" type="text" placeholder="e.g. foodie_priya" value={form.username} onChange={handleChange} required />
        <FormInput label="Email Address" name="email" type="email" placeholder="your@gmail.com" value={form.email} onChange={handleChange} required />
        <FormInput label="Password" name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} required />
        <FormInput label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} required />
        <SubmitBtn loading={loading}>Create Account 🚀</SubmitBtn>
      </form>
      <p className="mt-4 text-center text-xs text-gray-400">
        Want to list your restaurant?{' '}
        <Link to="/partner/register" className="text-orange-500 hover:underline">Join as Food Partner →</Link>
      </p>
    </AuthLayout>
  );
}
