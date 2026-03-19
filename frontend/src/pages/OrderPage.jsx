import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PAYMENT_METHODS = ['UPI', 'Card', 'Cash on Delivery'];

const UPI_APPS = [
  { name: 'GPay', emoji: '🟢' },
  { name: 'PhonePe', emoji: '🟣' },
  { name: 'Paytm', emoji: '🔵' },
  { name: 'BHIM', emoji: '🟠' },
];

export default function OrderPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const post = state?.post;

  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiApp, setUpiApp] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('order'); // 'order' | 'payment' | 'success'
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!post) return (
    <div className="pt-14 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">😕</div>
        <p className="text-gray-500">No item selected</p>
        <button onClick={() => navigate('/feed')} className="mt-4 text-orange-500 hover:underline text-sm">← Back to feed</button>
      </div>
    </div>
  );

  const price = Number(post.price) || 0;
  const total = price * quantity;

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!address.trim()) return setError('Please enter your delivery address.');
    if (!paymentMethod) return setError('Please select a payment method.');
    if (paymentMethod === 'UPI' && !upiApp) return setError('Please select a UPI app.');
    if (paymentMethod === 'Card') {
      if (!cardNumber || cardNumber.length < 16) return setError('Please enter a valid 16-digit card number.');
      if (!cardName) return setError('Please enter cardholder name.');
      if (!cardExpiry) return setError('Please enter card expiry.');
      if (!cardCvv || cardCvv.length < 3) return setError('Please enter a valid CVV.');
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing delay
    await new Promise(res => setTimeout(res, 2000));
    try {
      const { data } = await API.post('/orders', {
        postId: post._id,
        quantity,
        address,
        paymentMethod,
      });
      setPlacedOrder(data.order);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Try again.');
      setStep('order');
    }
    setLoading(false);
  };

  // ── Success Screen ──
  if (step === 'success') return (
    <div className="pt-14 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Order Placed!</h2>
        <p className="text-gray-500 text-sm mb-6">Your order has been successfully placed 🎉</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Item</span>
            <span className="font-medium text-gray-900">{post.dishName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Quantity</span>
            <span className="font-medium text-gray-900">{quantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-green-600">₹{total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium text-gray-900">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-orange-500">🔄 Placed</span>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-3 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-1">Delivering to:</p>
          <p className="text-sm font-medium text-gray-800">📍 {address}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/feed')}
            className="w-full py-3 border border-orange-200 text-orange-600 rounded-xl text-sm font-semibold hover:bg-orange-50 transition"
          >
            Back to Feed
          </button>
        </div>
      </div>
    </div>
  );

  // ── Payment Processing Screen ──
  if (step === 'payment') return (
    <div className="pt-14 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{post.emoji || '🍽️'}</div>
        <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Confirm Payment</h2>
        <p className="text-gray-500 text-sm mb-6">Review your order before confirming</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Item</span>
            <span className="font-medium text-gray-900">{post.dishName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Restaurant</span>
            <span className="font-medium text-gray-900">{post.partner?.restaurantName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Qty</span>
            <span className="font-medium text-gray-900">{quantity} × ₹{price}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-green-600 text-base">₹{total}</span>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-3 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-1">Delivering to:</p>
          <p className="text-sm font-medium text-gray-800">📍 {address}</p>
          <p className="text-xs text-gray-500 mt-1">Payment via {paymentMethod} {upiApp ? `(${upiApp})` : ''}</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition mb-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Processing Payment...
            </span>
          ) : `Pay ₹${total}`}
        </button>
        <button
          onClick={() => setStep('order')}
          disabled={loading}
          className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          ← Edit Order
        </button>
      </div>
    </div>
  );

  // ── Order Form ──
  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-6">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition mb-4">
          ← Back
        </button>

        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Place Order 🛒</h1>
        <p className="text-sm text-gray-400 mb-5">from {post.partner?.restaurantName}</p>

        {/* Item card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-3xl border border-orange-100">
            {post.emoji || '🍽️'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{post.dishName}</h3>
            <p className="text-xs text-gray-400">{post.partner?.restaurantName}</p>
            {price > 0 && <p className="text-sm font-bold text-green-600 mt-0.5">₹{price} per item</p>}
          </div>
        </div>

        <form onSubmit={handleOrderSubmit}>

          {/* Quantity */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-xl hover:bg-orange-200 transition flex items-center justify-center">
                −
              </button>
              <span className="text-2xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
              <button type="button"
                onClick={() => setQuantity(q => Math.min(20, q + 1))}
                className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-xl hover:bg-orange-200 transition flex items-center justify-center">
                +
              </button>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-lg text-green-600">₹{total}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Delivery Address 📍</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              placeholder="Enter your full delivery address..."
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Method 💳</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(method => (
                <div key={method}>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod(method); setUpiApp(''); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                      paymentMethod === method
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-100 hover:border-orange-200'
                    }`}
                  >
                    <span className="text-xl">
                      {method === 'UPI' ? '📱' : method === 'Card' ? '💳' : '💵'}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{method}</span>
                    {paymentMethod === method && <span className="ml-auto text-orange-500">✓</span>}
                  </button>

                  {/* UPI App selector */}
                  {method === 'UPI' && paymentMethod === 'UPI' && (
                    <div className="grid grid-cols-4 gap-2 mt-2 px-1">
                      {UPI_APPS.map(app => (
                        <button
                          type="button"
                          key={app.name}
                          onClick={() => setUpiApp(app.name)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition ${
                            upiApp === app.name ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-orange-200'
                          }`}
                        >
                          <span className="text-xl">{app.emoji}</span>
                          <span className="text-xs text-gray-600">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Card details */}
                  {method === 'Card' && paymentMethod === 'Card' && (
                    <div className="mt-2 space-y-2 px-1">
                      <input
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="Card Number (16 digits)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400"
                      />
                      <input
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Cardholder Name"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400"
                        />
                        <input
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="CVV"
                          type="password"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-orange-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          <button type="submit"
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition shadow-sm">
            Review Order →
          </button>
        </form>
      </div>
    </div>
  );
}