import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import ZwigatoLogo from '../components/Logo';
import foodImage from '../assets/food.jpg'

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('user');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 'user' ? '/auth/user/login' : '/auth/partner/login';
      const { data } = await API.post(endpoint, form);
      login(data.user, data.token);
      navigate(tab === 'user' ? '/feed' : '/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  const handleForgot = e => {
    e.preventDefault();
    if (!forgotEmail) return setForgotMsg('Please enter your email address.');
    setForgotMsg('✅ If this email is registered, a password reset link has been sent to your inbox.');
  };

  return (
    <div className="min-h-screen flex bg-white font-body">

      {/* ══════════ LEFT SIDE ══════════ */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-orange-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full opacity-25 translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Logo top left */}
        <div className="relative z-10 px-10 pt-8">
          <ZwigatoLogo size={44} />
        </div>
               {/* Tagline */}
                 <div className="relative z-10 px-10 pt-8 flex flex-col items-center text-center">
          <h1 className="font-display font-black leading-none text-gray-900 mb-1"
            style={{ fontSize: 'clamp(52px, 7vw, 80px)' }}>
            Watch.
          </h1>
          <h1 className="font-display font-black leading-none mb-1"
            style={{ fontSize: 'clamp(52px, 7vw, 80px)', color: 'transparent', WebkitTextStroke: '3px #E8520A' }}>
            Crave.
          </h1>
          <h1 className="font-display font-black leading-none mb-6"
            style={{ fontSize: 'clamp(52px, 7vw, 80px)', color: 'rgba(180, 100, 40, 0.22)' }}>
            Order.
          </h1>
          <p className="text-gray-600 text-base leading-relaxed" style={{ maxWidth: '400px' }}>
            Discover dishes through mouth-watering short videos. See something you love?{' '}
            <span className="text-orange-600 font-semibold underline underline-offset-2">Tap to order instantly</span>
            {' '}— no menus, no friction.
          </p>
        </div>

        {/* Food image */}
        <div className="relative z-10 flex-1 mx-10 mt-6 mb-10 rounded-2xl overflow-hidden shadow-lg">
          <img
           src={foodImage}
            alt="Delicious food"
            className="w-full h-full object-cover"
            style={{ maxHeight: '280px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50/40 to-transparent pointer-events-none" />
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 mx-10 mb-8 flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-100 shadow-sm w-fit">
          <span className="text-sm">🏪</span>
          <span className="text-xs text-gray-600 font-medium">Join 500+ restaurants already on Zwigato</span>
        </div>
      </div>

      {/*  RIGHT SIDE — Login */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[45%] px-8 py-12 bg-white">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <ZwigatoLogo size={38} />
        </div>

        <div className="w-full max-w-sm">
          {!showForgot ? (
            <>
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-7">
                <button
                  onClick={() => { setTab('user'); setError(''); setForm({ email: '', password: '' }); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'user' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  😋 Food Lover
                </button>
                <button
                  onClick={() => { setTab('partner'); setError(''); setForm({ email: '', password: '' }); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'partner' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  🏪 Food Partner
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {tab === 'user' ? 'Welcome back! 👋' : 'Partner Sign In 🏪'}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                {tab === 'user' ? 'Log in to explore amazing food' : 'Manage your restaurant on Zwigato'}
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <input name="email" type="email" placeholder="Email address"
                  value={form.email} onChange={handleChange} required
                   autoComplete="off"
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition mb-4" />
                           <input name="password" type="password" placeholder="Password"
                              value={form.password} onChange={handleChange} required
                                autoComplete="new-password"
                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition mb-2" />
                <div className="flex justify-end mb-5">
                  <button type="button" onClick={() => { setShowForgot(true); setError(''); }}
                    className="text-xs text-orange-500 hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition text-sm shadow-sm">
                  {loading ? '⏳ Signing in...' : 'Log In'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <Link to={tab === 'user' ? '/register' : '/partner/register'}
                className="block w-full py-3 border-2 border-orange-200 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition text-sm text-center">
                {tab === 'user' ? 'Create new account' : 'Register your restaurant'}
              </Link>

              <p className="mt-5 text-xs text-center text-gray-400">
                {tab === 'user' ? (
                  <>Own a restaurant?{' '}<button onClick={() => setTab('partner')} className="text-orange-500 font-semibold hover:underline">Sign in as Partner →</button></>
                ) : (
                  <>Food lover?{' '}<button onClick={() => setTab('user')} className="text-orange-500 font-semibold hover:underline">Sign in as User →</button></>
                )}
              </p>
            </>
          ) : (
            <>
              <button onClick={() => { setShowForgot(false); setForgotEmail(''); setForgotMsg(''); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition">
                ← Back to login
              </button>
              <div className="text-4xl mb-4 text-center">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">Forgot Password?</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">Enter your registered email and we'll send you a reset link.</p>
              {forgotMsg ? (
                <div className="px-4 py-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center">
                  {forgotMsg}
                  <div className="mt-4">
                    <button onClick={() => { setShowForgot(false); setForgotEmail(''); setForgotMsg(''); }}
                      className="text-orange-500 font-semibold hover:underline text-sm">
                      Back to Login →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgot}>
                  <input type="email" placeholder="your@email.com" value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-orange-400 outline-none transition mb-4" />
                  <button type="submit"
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition text-sm">
                    Send Reset Link
                  </button>
                </form>
              )}
            </>
          )}
        </div>
        <p className="mt-10 text-xs text-gray-300 text-center">© 2024 Zwigato · Made with ❤️ for food lovers</p>
      </div>
    </div>
  );
}