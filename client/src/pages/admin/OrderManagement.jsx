import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ArrowLeft, Loader2, Check, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert(`Order status updated to ${newStatus}`);
      fetchAllOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Order Management</h1>
            <p className="text-slate-400 text-sm">Review incoming purchases and manage shipping statuses</p>
          </div>
        </div>
        
        <button onClick={fetchAllOrders} className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
          <RefreshCw className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Orders Grid/Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span>Loading orders dashboard...</span>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-600 bg-red-50 border border-red-100 rounded-3xl max-w-md mx-auto my-6 font-semibold">
            {error}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Purchased On</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Payment Status</th>
                  <th className="py-4 px-6">Shipment Status</th>
                  <th className="py-4 px-6 text-center">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-600 text-xs">
                      {order._id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {order.user?.name || 'Deleted Account'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-800">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs border ${
                        order.isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs border ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : order.status === 'Shipped'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400">
            No orders have been placed yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
