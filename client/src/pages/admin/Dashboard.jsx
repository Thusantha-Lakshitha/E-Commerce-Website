import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, ChevronRight, Loader2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/orders/stats/dashboard');
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <span className="text-slate-400 font-medium">Loading analytics dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 mb-4">
          <p className="font-semibold">{error}</p>
        </div>
        <button onClick={fetchDashboardStats} className="btn-primary py-2 px-6">
          Retry Fetching Stats
        </button>
      </div>
    );
  }

  // Set up Chart.js Data
  const chartData = {
    labels: stats.monthlyRevenue.map((r) => r.month),
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue ($)',
        data: stats.monthlyRevenue.map((r) => r.revenue),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6',
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 12,
        backgroundColor: '#1e293b',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#94a3b8',
          font: { weight: 'bold' },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { weight: 'bold' },
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time statistics & stores revenues analytics</p>
        </div>
        
        {/* Navigation Shortcut to Admin Pages */}
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1">
            Manage Products
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/admin/orders" className="btn bg-slate-900 text-white hover:bg-slate-800 py-2 px-4 text-xs font-bold flex items-center gap-1">
            Manage Orders
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales Revenue', value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Total Orders Count', value: stats.totalOrders, icon: ShoppingCart, color: 'text-primary-600 bg-primary-50 border-primary-100' },
          { label: 'Total Registered Users', value: stats.totalUsers, icon: Users, color: 'text-sky-600 bg-sky-50 border-sky-100' },
          { label: 'Catalog Products Count', value: stats.totalProducts, icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
        ].map((item, index) => (
          <div key={index} className="glass-card p-6 border border-slate-100 flex items-center gap-5">
            <div className={`p-4 rounded-2xl border ${item.color.split(' ')[1]} ${item.color.split(' ')[2]} ${item.color.split(' ')[0]}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{item.label}</p>
              <h4 className="text-2xl font-extrabold text-slate-800">{item.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Row: Revenue Chart & Low Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-lg">Sales Revenue Trend</h3>
          <div className="h-80 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Stock alerts */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 h-full max-h-[440px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alerts
            </h3>
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {stats.lowStockCount} items
            </span>
          </div>

          <div className="overflow-y-auto space-y-3.5 pr-1 flex-grow">
            {stats.lowStockAlerts && stats.lowStockAlerts.length > 0 ? (
              stats.lowStockAlerts.map((prod) => (
                <div key={prod._id} className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="font-bold text-slate-800 line-clamp-1">{prod.name}</span>
                  <span className="font-extrabold text-red-600 flex-shrink-0 ml-3">
                    {prod.stock === 0 ? 'OUT OF STOCK' : `${prod.stock} left`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-16 text-sm">
                No items are currently running low on stocks. Nice job!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row: Best Sellers products */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
          <Award className="w-5 h-5 text-indigo-500" />
          Best Selling Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.bestSellers && stats.bestSellers.length > 0 ? (
                stats.bestSellers.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-800">{prod.name}</td>
                    <td className="py-4 px-4">${prod.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary-600">
                      {prod.category}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 text-right">{prod.unitsSold} units</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-slate-400 py-6">
                    Place some paid orders to compute best sellers analytics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
