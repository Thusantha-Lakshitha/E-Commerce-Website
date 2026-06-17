import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { CheckCircle2, ChevronRight, MapPin, CreditCard, ChevronLeft } from 'lucide-react';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51PTestPublishableKeyMock123456789'
);

const Checkout = () => {
  const { cartItems, totalPrice, itemsPrice, taxPrice, shippingPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState(1); // 1 = Shipping, 2 = Payment, 3 = Success

  // Shipping address form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  
  const [shippingError, setShippingError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setShippingError('All shipping address fields are required.');
      return;
    }
    setShippingError('');
    setStep(2);
  };

  const handlePaymentSuccess = (order) => {
    setCompletedOrder(order);
    clearCart();
    setStep(3);
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="font-extrabold text-2xl text-slate-800 mb-2">Checkout Empty</h2>
        <p className="text-slate-500 text-sm mb-6">No products in your cart. Add some products to start.</p>
        <Link to="/products" className="btn-primary py-2.5 px-6">Explore Products</Link>
      </div>
    );
  }

  // Render Step 3: Success Screen
  if (step === 3 && completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-8 animate-shimmer">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-800">Order Placed Successfully!</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Thank you for shopping with us. We have emailed you an order confirmation. Your package will ship shortly.
          </p>
        </div>

        {/* Receipt card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left divide-y divide-slate-100">
          <div className="pb-4 space-y-1 text-sm">
            <p className="text-slate-400">Order Identification Number</p>
            <p className="font-mono font-bold text-slate-800 text-base">{completedOrder._id}</p>
          </div>
          <div className="py-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Payment Status</p>
              <p className="font-bold text-emerald-600">Paid securely via Card</p>
            </div>
            <div>
              <p className="text-slate-400">Total Price Paid</p>
              <p className="font-bold text-slate-800">${completedOrder.totalPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="pt-4 space-y-1 text-sm">
            <p className="text-slate-400">Delivering To</p>
            <p className="font-semibold text-slate-800">
              {completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city},{' '}
              {completedOrder.shippingAddress.postalCode}, {completedOrder.shippingAddress.country}
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/products" className="btn-secondary py-3 px-6 text-sm">
            Continue Shopping
          </Link>
          <Link to="/profile" className="btn-primary py-3 px-6 text-sm">
            View Order History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Progress indicators */}
      <div className="flex justify-center items-center gap-4 text-sm font-semibold max-w-md mx-auto">
        <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-primary-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
            step === 1 ? 'bg-primary-600 text-white' : 'bg-slate-200'
          }`}>1</span>
          <span>Shipping</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-primary-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
            step === 2 ? 'bg-primary-600 text-white' : 'bg-slate-200'
          }`}>2</span>
          <span>Payment Details</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side forms */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-extrabold text-slate-800">Shipping Information</h2>
              </div>

              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St, Apt 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      placeholder="Seattle"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Postal Code</label>
                    <input
                      type="text"
                      placeholder="98101"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {shippingError && (
                  <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-100">
                    {shippingError}
                  </div>
                )}

                <button type="submit" className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                  <span>Continue to Payment Method</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-extrabold text-slate-800">Secure Payment</h2>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-primary-600 flex items-center gap-1 text-sm font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Edit Address
                </button>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm
                  shippingAddress={{ address, city, postalCode, country }}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Right Side order summary review */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Review Items</h3>
            <div className="max-h-60 overflow-y-auto space-y-3.5 divide-y divide-slate-100 pr-1">
              {cartItems.map((item) => (
                <div key={item.product} className="flex gap-3 pt-3 first:pt-0">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-50 flex-shrink-0" />
                  <div className="text-xs space-y-0.5 flex-grow">
                    <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-slate-400">Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-800 text-xs">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Billing Info</h3>
            <div className="space-y-3 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Items Cost</span>
                <span className="font-bold text-slate-800">${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Cost</span>
                <span className="font-bold text-slate-800">${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span className="font-bold text-slate-800">
                  {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between text-sm text-slate-800 font-extrabold">
                <span>Total Cost</span>
                <span className="text-primary-600 text-base">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
