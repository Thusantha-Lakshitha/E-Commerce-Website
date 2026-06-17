import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
  const { userInfo, wishlist, fetchWishlist } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo) {
      fetchWishlist();
    }
  }, []);

  if (!userInfo) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Heart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl text-slate-800">Login Required</h2>
          <p className="text-slate-500 text-sm">
            Please log in to your account to view and manage your personal wishlist.
          </p>
        </div>
        <Link to="/login?redirect=wishlist" className="btn-primary py-3 px-6 text-sm">
          Login Now
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-400 shadow-inner">
          <Heart className="w-10 h-10 fill-current" />
        </div>
        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl text-slate-800">Your Wishlist is Empty</h2>
          <p className="text-slate-400 text-sm">
            Save your favorite items here to purchase them later.
          </p>
        </div>
        <Link to="/products" className="btn-primary py-3.5 px-8 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Start Exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">My Saved Wishlist</h1>
        <p className="text-slate-400 text-sm mt-1">
          You have {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved in your wishlist
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
