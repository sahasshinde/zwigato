import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function OrderPage() {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const post = state?.post;
  const partner = state?.partner || post?.partner;

  const [step, setStep] = useState('details'); // details → payment → confirmed
  const [form, setForm] = useState({ address: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  if (!post) return (
    <div className="pt-20 flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500">No order details found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-orange-500 text-sm">← Go back</button>
    </div>
  );

  const handlePlaceOrder = async () => {
    if (!form.address || !form.phone) return setError('Please fill address and phone.');
    if (!paymentMethod) return setError('Please select a payment method.');
    if (paymentMethod === 'upi' && !upiId) return setError('Please enter UPI ID.');
    if (paymentMethod === 'card' && (!card.number || !card.expiry || !card.cvv || !card.name))
      return setError('Please fill all card details.');

    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/orders', {
        partner: partner?._id || post.partner,
        post: post._id,
        dishName: post.dishName,
        price: post.price,
        address: form.address,
        phone: form.phone,
        paymentMethod
      });
      setOrderId(data.order._id);
      setStep('confirmed');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Try again.');
    }
    setLoading(false);
  };

  if (step === 'confirmed') return (
    <div className="pt-14 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 text-sm mb-1">Your order for</p>
        <p className="font-semibold text-orange-500 text-lg mb-1">{post.dishName}</p>
        <p className="text-gray-400 text-xs mb-4">has been placed successfully</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Order ID:</span> #{orderId.slice(-6).toUpperCase()}</p>
          <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Amount:</span> ₹{post.price}</p>
          <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Payment:</span> {paymentMethod.toUpperCase()}</p>
          <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Delivering to:</span> {form.address}</p>
        </div>
        <p className="text-xs text-gray-400 mb-6">Estimated delivery: 30-45 minutes 🛵</p>
        <button onClick={() => navigate('/discover')}
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition">
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-orange-500 mb-4 flex items-center gap-1">← Back</button>

        <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Place Order 🛒</h1>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{post.emoji || '🍽️'}</span>
            <div>
              <p className="font-semibold text-gray-900">{post.dishName}</p>
              <p className="text-sm text-gray-500">{partner?.restaurantName || 'Restaurant'}</p>
              {post.price && <p className="text-green-600 font-semibold">₹{post.price}</p>}
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-800 mb-4">Delivery Details</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input value={user?.name || ''} disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              rows={3}
              placeholder="Room no, Building, Street, Area, City..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ id: 'upi', label: 'UPI', icon: '📱' }, { id: 'card', label: 'Card', icon: '💳' }, { id: 'cod', label: 'Cash', icon: '💵' }].map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition flex flex-col items-center gap-1 ${paymentMethod === m.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                <span className="text-xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* UPI */}
          {paymentMethod === 'upi' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
            </div>
          )}

          {/* Card */}
          {paymentMethod === 'card' && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })}
                  placeholder="1234 5678 9012 3456" maxLength={19}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })}
                    placeholder="MM/YY" maxLength={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })}
                    placeholder="123" maxLength={3} type="password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400" />
              </div>
            </div>
          )}

          {/* COD */}
          {paymentMethod === 'cod' && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-700">💵 Pay with cash when your order arrives!</p>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button onClick={handlePlaceOrder} disabled={loading}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-lg hover:bg-orange-600 disabled:opacity-60 transition shadow-lg">
          {loading ? 'Placing Order...' : `Pay ₹${post.price || '0'} & Order 🛒`}
        </button>
      </div>
    </div>
  );
}