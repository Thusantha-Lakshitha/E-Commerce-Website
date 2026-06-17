import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductContext from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ProductListing = () => {
  const { products, categories, fetchProducts, loading, pages, page } = useContext(ProductContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state mirroring query parameters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const params = {};
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword');
    if (searchParams.get('category')) params.category = searchParams.get('category');
    if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
    if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
    if (searchParams.get('sortBy')) params.sortBy = searchParams.get('sortBy');
    if (searchParams.get('page')) params.page = searchParams.get('page');

    fetchProducts(params);
  }, [searchParams]);

  const applyFilters = (pageOverride) => {
    const newParams = {};
    if (keyword) newParams.keyword = keyword;
    if (category) newParams.category = category;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (sortBy) newParams.sortBy = sortBy;
    
    // Set page
    const targetPage = pageOverride !== undefined ? pageOverride : 1;
    if (targetPage > 1) newParams.page = targetPage;

    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar (Search & Sort) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="form-input pl-11 pr-20 py-2.5"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold">
            Search
          </button>
        </form>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              // Proactively apply sorting
              const newParams = Object.fromEntries(searchParams);
              if (e.target.value) newParams.sortBy = e.target.value;
              else delete newParams.sortBy;
              setSearchParams(newParams);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
          >
            <option value="">Sort By: Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Rating: Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              Filter Options
            </h3>
            <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 font-bold">
              Clear All
            </button>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 text-sm">Categories</h4>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setCategory('')}
                className={`text-left text-sm py-1 px-2.5 rounded-lg font-medium transition-colors ${
                  category === '' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-primary-600'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setCategory(cat)}
                  className={`text-left text-sm py-1 px-2.5 rounded-lg font-medium transition-colors ${
                    category === cat ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-primary-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 text-sm">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input py-2 text-xs"
              />
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-input py-2 text-xs"
              />
            </div>
          </div>

          <button onClick={() => applyFilters(1)} className="w-full btn-primary py-2.5 text-sm">
            Apply Filters
          </button>
        </aside>

        {/* Mobile Filters overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-80 bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-shimmer">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-lg">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm">Category</h4>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl w-full text-sm focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm">Price Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="form-input py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="form-input py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={clearFilters} className="w-1/2 btn-secondary py-3 text-sm">
                  Reset
                </button>
                <button onClick={() => applyFilters(1)} className="w-1/2 btn-primary py-3 text-sm">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <main className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card aspect-[4/5] animate-shimmer" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => applyFilters(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => applyFilters(i + 1)}
                      className={`w-10 h-10 font-bold rounded-xl text-sm transition-all ${
                        page === i + 1
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => applyFilters(page + 1)}
                    disabled={page === pages}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center text-slate-500 max-w-md mx-auto">
              <h3 className="font-bold text-slate-700 text-lg mb-1">No products found</h3>
              <p className="text-sm">Try clearing your filters or altering your search query terms.</p>
              <button onClick={clearFilters} className="btn-primary py-2 px-5 text-xs mt-4">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
