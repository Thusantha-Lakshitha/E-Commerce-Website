import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Menu, X, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              <ShoppingBag className="w-7 h-7 text-primary-600" />
              Lux<span className="text-slate-800">Zone</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                Shop Catalog
              </Link>
              <Link to="/wishlist" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                Wishlist
              </Link>
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/wishlist" className="text-slate-600 hover:text-primary-600 relative p-2 transition-colors">
              <Heart className="w-6 h-6" />
            </Link>
            
            <Link to="/cart" className="text-slate-600 hover:text-primary-600 relative p-2 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalCartQty > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-indigo-500 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white animate-pulse">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-slate-700 hover:text-primary-600 focus:outline-none p-1 font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold uppercase shadow-sm">
                    {userInfo.name.charAt(0)}
                  </div>
                  <span>{userInfo.name.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    {userInfo.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary py-2 px-5 text-sm font-semibold">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm font-semibold">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary-600 focus:outline-none p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-3 shadow-md animate-shimmer">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-slate-700 hover:text-primary-600 font-medium py-2"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setIsOpen(false)}
            className="block text-slate-700 hover:text-primary-600 font-medium py-2"
          >
            Shop Catalog
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setIsOpen(false)}
            className="block text-slate-700 hover:text-primary-600 font-medium py-2"
          >
            Wishlist
          </Link>
          <Link
            to="/cart"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between text-slate-700 hover:text-primary-600 font-medium py-2"
          >
            <span>Shopping Cart</span>
            {totalCartQty > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {totalCartQty}
              </span>
            )}
          </Link>

          {userInfo ? (
            <>
              <hr className="border-slate-100 my-2" />
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block text-slate-700 hover:text-primary-600 font-medium py-2"
              >
                Profile Dashboard
              </Link>
              {userInfo.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-700 hover:text-primary-600 font-medium py-2"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 hover:bg-red-50 font-medium py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center btn-secondary py-2.5 w-full text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center btn-primary py-2.5 w-full text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
