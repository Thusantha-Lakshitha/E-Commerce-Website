import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice, updateCartQty, removeFromCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-500 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl text-slate-800">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm">
            Before checkout, you must add some items to your shopping cart.
          </p>
        </div>
        <Link to="/products" className="btn-primary py-3.5 px-8 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product}
              className="glass-card p-5 border border-slate-100 flex flex-col sm:flex-row items-center gap-5 justify-between"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                />
                <div className="space-y-1">
                  <Link to={`/products/${item.product}`} className="hover:text-primary-600 transition-colors">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-primary-600 font-extrabold text-sm">${item.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => updateCartQty(item.product, Math.max(1, item.qty - 1))}
                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 font-bold transition-colors text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 font-bold text-slate-800 text-xs">{item.qty}</span>
                  <button
                    onClick={() => updateCartQty(item.product, Math.min(item.stock, item.qty + 1))}
                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 font-bold transition-colors text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="font-extrabold text-slate-800 text-base w-20 text-right">
                  ${(item.price * item.qty).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.product)}
                  className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Aggregates summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800">Order Summary</h3>

            <div className="space-y-3.5 text-sm text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                <span className="font-bold text-slate-800">${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (15%)</span>
                <span className="font-bold text-slate-800">${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-800">
                  {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              {shippingPrice > 0 && (
                <p className="text-[11px] text-primary-500 font-semibold bg-primary-50 p-2 rounded-lg">
                  💡 Add ${(100 - itemsPrice).toFixed(2)} more for FREE shipping!
                </p>
              )}
              <hr className="border-slate-100" />
              <div className="flex justify-between text-base text-slate-800 font-extrabold">
                <span>Order Total</span>
                <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
