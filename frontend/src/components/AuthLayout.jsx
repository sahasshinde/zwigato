import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footerText, footerLink, footerLinkText }) {
  return (
    <div className="auth-gradient min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <span className="text-3xl">🍽️</span>
        <span className="font-display font-bold text-2xl text-orange-600">Zwigato</span>
      </Link>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">{title}</h1>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
        {children}
      </div>
      {footerText && (
        <p className="mt-6 text-sm text-gray-500">
          {footerText}{' '}
          <Link to={footerLink} className="text-orange-600 font-semibold hover:underline">{footerLinkText}</Link>
        </p>
      )}
    </div>
  );
}

export function FormInput({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, error, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm mt-2"
    >
      {loading ? '⏳ Please wait...' : children}
    </button>
  );
}

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      ⚠️ {message}
    </div>
  );
}

export function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
      ✅ {message}
    </div>
  );
}
