import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductContext from '../context/ProductContext';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { Star, Heart, ShoppingCart, Loader2, ArrowLeft, Send } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { fetchProductDetails, submitReview } = useContext(ProductContext);
  const { userInfo, wishlist, toggleWishlist } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchProductDetails(id);
      setProduct(data);
      setActiveImage(data.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Product failed to load');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const isWishlisted = wishlist.some((item) => item._id === product?._id || item === product?._id);

  const handleWishlistClick = () => {
    if (!userInfo) {
      alert('Please login to add products to your wishlist.');
      return;
    }
    toggleWishlist(product._id);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart(product, qty);
    alert(`${qty} x ${product.name} added to cart!`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      setReviewError('Please write a comment');
      return;
    }
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await submitReview(product._id, rating, comment);
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      // Reload product details to show new review
      await loadProduct();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <span className="text-slate-400 font-medium">Loading product details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100">
          <p className="font-semibold">{error || 'Product details not found'}</p>
        </div>
        <Link to="/products" className="btn-primary py-2.5 px-6 inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary-600 font-bold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Products Catalog
      </Link>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
        {/* Images Columns */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl aspect-[4/3] overflow-hidden border border-slate-100 flex items-center justify-center">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Columns */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-800 mt-1">{product.name}</h1>
              </div>

              <button
                onClick={handleWishlistClick}
                className={`p-3 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-red-50 border-red-100 text-red-500'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Ratings summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500 font-semibold">
                {product.rating.toFixed(1)} / 5.0 ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-extrabold text-slate-800">${product.price.toFixed(2)}</div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-700 text-sm">Product Description</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{product.description}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Quantity and Cart buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-slate-700">Availability:</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  product.stock > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-slate-800 text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <button onClick={handleAddToCart} className="btn-primary py-3 px-8 flex items-center gap-2 flex-grow sm:flex-none">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Shopping Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: Submit review */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-6">
          <h3 className="text-xl font-extrabold text-slate-800">Submit Product Review</h3>
          {userInfo ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-transform active:scale-90 ${
                        rating >= star ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Write Comments</label>
                <textarea
                  rows="4"
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input text-sm resize-none"
                />
              </div>

              {reviewError && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100">
                  {reviewSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-1.5"
              >
                {reviewLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit Review</span>
              </button>
            </form>
          ) : (
            <div className="text-slate-500 text-sm text-center py-6">
              <p className="mb-4">You must be logged in to write product reviews.</p>
              <Link to="/login" className="btn-secondary text-xs px-4 py-2">
                Login Now
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: List of reviews */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-800">
            Reviews ({product.reviews?.length || 0})
          </h3>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">{rev.name}</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-500 text-sm">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 text-center rounded-2xl border border-slate-100 text-slate-400 text-sm">
              No reviews yet for this product. Be the first to review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
