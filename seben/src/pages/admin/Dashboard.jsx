// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Eye,
  ArrowUp,
  ArrowDown,
  Loader,
} from 'lucide-react';
import adminService from '../../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, ordersRes, productsRes, salesRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentOrders(5),
        adminService.getTopProducts(5),
        adminService.getSalesData('7days'),
      ]);

      setStats(statsRes);
      setRecentOrders(ordersRes.orders || []);
      setTopProducts(productsRes.products || []);
      setSalesData(salesRes.salesData || []);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      PROCESSING: 'bg-blue-500/20 text-blue-400',
      SHIPPED: 'bg-purple-500/20 text-purple-400',
      DELIVERED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-seben-gold" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded">
        <p>Error loading dashboard: {error}</p>
        <button onClick={fetchDashboardData} className="mt-2 btn-outline-light btn-sm">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "This Month's Revenue",
      value: formatPrice(stats?.revenue?.thisMonth || 0),
      change: stats?.revenue?.change || 0,
      icon: DollarSign,
      color: 'gold',
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      subtext: `${stats?.orders?.today || 0} today`,
      icon: ShoppingBag,
      color: 'blue',
    },
    {
      title: 'Total Customers',
      value: stats?.customers?.total || 0,
      subtext: `${stats?.customers?.newThisMonth || 0} this month`,
      icon: Users,
      color: 'green',
    },
    {
      title: 'Products',
      value: stats?.products?.total || 0,
      subtext: `${stats?.products?.lowStock || 0} low stock`,
      icon: Package,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif text-seben-cream">Dashboard</h1>
        <p className="text-seben-cream/60 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-seben-black border border-seben-slate p-6 rounded"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded ${
                  stat.color === 'gold'
                    ? 'bg-seben-gold/20 text-seben-gold'
                    : stat.color === 'blue'
                    ? 'bg-blue-500/20 text-blue-400'
                    : stat.color === 'green'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                <stat.icon size={24} />
              </div>
              {stat.change !== undefined && (
                <span
                  className={`flex items-center gap-1 text-sm ${
                    stat.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
            <p className="text-seben-cream/60 text-sm mb-1">{stat.title}</p>
            <p className="text-seben-cream text-2xl font-semibold">{stat.value}</p>
            {stat.subtext && (
              <p className="text-seben-cream/40 text-sm mt-1">{stat.subtext}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-seben-black border border-seben-slate rounded overflow-hidden">
          <div className="p-6 border-b border-seben-slate flex items-center justify-between">
            <h2 className="text-lg font-medium text-seben-cream">Recent Orders</h2>
            <Link to="/admin/orders" className="text-seben-gold text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-seben-cream/60">
              No orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-seben-slate">
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-seben-slate">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-seben-charcoal transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-seben-gold hover:underline text-sm"
                        >
                          {order.orderId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-seben-cream">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-seben-cream">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-seben-black border border-seben-slate rounded overflow-hidden">
          <div className="p-6 border-b border-seben-slate flex items-center justify-between">
            <h2 className="text-lg font-medium text-seben-cream">Top Products</h2>
            <Link to="/admin/products" className="text-seben-gold text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {topProducts.length === 0 ? (
            <div className="p-6 text-center text-seben-cream/60">
              No products yet
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <img
                    src={product.image || 'https://via.placeholder.com/50'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-seben-cream truncate">{product.name}</p>
                    <p className="text-xs text-seben-cream/60">
                      {product.sold} sold • {formatPrice(product.revenue)} revenue
                    </p>
                  </div>
                  <Link 
                    to={`/admin/products/edit/${product.id}`}
                    className="p-2 text-seben-cream/60 hover:text-seben-gold transition-colors"
                  >
                    <Eye size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;