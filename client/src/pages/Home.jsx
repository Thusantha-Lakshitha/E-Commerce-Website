import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductContext from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

const Home = () => {
  const { products, fetchProducts, loading } = useContext(ProductContext);

  useEffect(() => {
    fetchProducts({ pageSize: 4 });
  }, []);

  const categories = [
    { name: 'Electronics', count: '120+ Products', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=60' },
    { name: 'Fashion', count: '450+ Products', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=60' },
    { name: 'Books', count: '80+ Products', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=60' },
    { name: 'Home Decor', count: '300+ Products', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden py-20 px-6 sm:px-12 rounded-b-[2rem] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-primary-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Summer Collection 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none">
              Shop Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Live Better.</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg mx-auto lg:mx-0">
              Discover unique quality products at competitive prices. Fast delivery, secure payments, and outstanding support.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/products" className="btn-primary py-3.5 px-8 flex items-center gap-2">
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/wishlist" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3.5 px-8">
                View Wishlist
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative justify-self-center">
            <div className="w-[450px] h-[350px] bg-gradient-to-r from-primary-500 to-indigo-500 rounded-3xl opacity-20 blur-3xl absolute -inset-2" />
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80"
              alt="Hero Banner"
              className="relative w-[450px] h-[350px] object-cover rounded-3xl shadow-2xl border border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Services banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
          { icon: ShieldCheck, title: 'Secure Payment', desc: 'Fully encrypted checkout' },
          { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
          { icon: ShoppingBag, title: 'Quality Products', desc: '100% genuine guaranteed' }
        ].map((service, index) => (
          <div key={index} className="glass-card p-6 flex items-center gap-4 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
              <service.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{service.title}</h4>
              <p className="text-slate-400 text-xs">{service.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Browse by Category</h2>
            <p className="text-slate-400 text-sm">Find exactly what you are searching for</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <Link
              key={index}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="glass-card overflow-hidden group aspect-video relative flex items-end p-5"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="font-extrabold text-lg">{cat.name}</h3>
                <span className="text-xs text-slate-300 font-medium">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Featured Products</h2>
            <p className="text-slate-400 text-sm">Top picks curated just for you</p>
          </div>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1">
            See All Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card aspect-[4/5] animate-shimmer" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-slate-500 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-700 text-lg mb-1">No products found</h3>
            <p className="text-sm">We are uploading catalog products shortly. Visit us again soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
