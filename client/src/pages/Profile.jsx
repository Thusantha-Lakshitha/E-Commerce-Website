import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { User, ClipboardList, Check, Loader2, ArrowRight } from 'lucide-react';

const Profile = () => {
  const { userInfo, updateProfile, loading } = useContext(AuthContext);

  // Profile Form States
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [profileSubmitLoading, setProfileSubmitLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (password && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setProfileSubmitLoading(true);
    try {
      const payload = { name, email };
      if (password) payload.password = password;
      await updateProfile(payload);
      setFormSuccess('Profile details updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setFormError(err.message || 'Failed to update profile info');
    } finally {
      setProfileSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">My Profile Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal information and track your shipping order states
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Update Profile Info */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password (optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep old"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-sm"
              />
            </div>

            {password && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Retype password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input text-sm"
                />
              </div>
            )}

            {formError && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-semibold">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileSubmitLoading}
              className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
            >
              {profileSubmitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* Right Side: Order history */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-slate-800">Order History ({orders.length})</h2>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center items-center py-12 gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span>Fetching order lists...</span>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold">Order ID</p>
                      <p className="font-mono font-bold text-slate-700 mt-0.5">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Ordered On</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Total Amount</p>
                      <p className="font-extrabold text-primary-600 mt-0.5">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] border ${
                          order.isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      <span
                        className={`font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] border ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : order.status === 'Shipped'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : order.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Items Summary list */}
                  <div className="space-y-3">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                        <div className="text-xs space-y-0.5 flex-grow">
                          <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-slate-400">Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400 text-sm space-y-3">
              <p>You have not placed any orders yet.</p>
              <ArrowRight className="w-5 h-5 mx-auto text-slate-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
