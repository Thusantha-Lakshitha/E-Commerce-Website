import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { userInfo, wishlist, toggleWishlist } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const isWishlisted = wishlist.some((item) => item._id === product._id || item === product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert('Please login to add products to your wishlist.');
      return;
    }
    toggleWishlist(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="glass-card glass-card-hover flex flex-col h-full group overflow-hidden relative border border-slate-100">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full transition-all duration-300 shadow-md ${
          isWishlisted
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/95 text-slate-400 hover:text-red-500'
        }`}
      >
        <Heart className="w-5 h-5 fill-current" />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="overflow-hidden bg-slate-100 aspect-video relative flex items-center justify-center">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Body */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
          {product.category}
        </span>
        <Link to={`/products/${product._id}`} className="hover:text-primary-600 transition-colors">
          <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>

        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-4 mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-current'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">({product.numReviews})</span>
          </div>
          <span className="font-extrabold text-slate-800 text-xl">${product.price.toFixed(2)}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            product.stock === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white shadow-sm'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
