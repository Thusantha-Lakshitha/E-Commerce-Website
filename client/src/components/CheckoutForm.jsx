import React, { useState, useContext } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { CreditCard, ShieldCheck, Loader2 } from 'lucide-react';

const CheckoutForm = ({ shippingAddress, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, totalPrice, itemsPrice, taxPrice, shippingPrice } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Fetch payment intent from backend
      const { data } = await api.post('/orders/payment-intent', {
        amount: totalPrice,
      });

      const { clientSecret, isMock } = data;

      let paymentResultId = '';
      let paymentStatus = 'succeeded';

      if (isMock) {
        // Simulated Stripe flow for mock environment
        console.log('Simulating Stripe payment processing...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        paymentResultId = `mock_stripe_charge_${Math.random().toString(36).substring(7)}`;
      } else {
        // Real Stripe processing
        const cardElement = elements.getElement(CardElement);
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: userInfo.name,
                email: userInfo.email,
              },
            },
          }
        );

        if (stripeError) {
          setError(stripeError.message);
          setLoading(false);
          return;
        }

        paymentResultId = paymentIntent.id;
        paymentStatus = paymentIntent.status;
      }

      if (paymentStatus === 'succeeded') {
        // 2. Post order to DB
        const orderData = {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod: 'Stripe',
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          paymentResult: {
            id: paymentResultId,
            status: paymentStatus,
            update_time: new Date().toISOString(),
            email_address: userInfo.email,
          },
        };

        const { data: createdOrder } = await api.post('/orders', orderData);
        setSuccess(true);
        setLoading(false);
        onPaymentSuccess(createdOrder);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Payment confirmation failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <span>Credit or Debit Card</span>
        </div>

        {/* Card input field wrapper */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e293b',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
                invalid: {
                  color: '#dc2626',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl font-medium border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Secure Payment...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>Pay ${totalPrice.toFixed(2)} Securely</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-2">
        Payments processed securely using 256-bit SSL encryption.
      </p>
    </form>
  );
};

export default CheckoutForm;
