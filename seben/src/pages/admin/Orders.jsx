// frontend/src/pages/admin/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  Loader
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [filterStatus, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllOrders({
        status: filterStatus !== 'all' ? filterStatus : '',
        search: searchQuery,
        page: currentPage,
        limit: 10
      });
      
      // Handle both possible response structures
      const ordersData = response.data?.orders || response.orders || [];
      const totalPagesData = response.totalPages || response.data?.totalPages || 1;
      
      setOrders(ordersData);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getOrderStats();
      setStats(response.data || response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'PROCESSING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SHIPPED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'DELIVERED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const statsCards = [
    { label: 'Total Orders', value: stats?.total || 0, icon: ShoppingBag, color: 'text-seben-gold' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'text-yellow-400' },
    { label: 'Processing', value: stats?.processing || 0, icon: Package, color: 'text-blue-400' },
    { label: 'Delivered', value: stats?.delivered || 0, icon: CheckCircle, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-seben-cream">Orders</h1>
          <p className="text-seben-cream/60 mt-1">Manage customer orders</p>
        </div>
        
        <button className="btn-outline-light btn-sm flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-seben-black border border-seben-slate p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-seben-cream/60 text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold text-seben-cream mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`${stat.color}`} size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-seben-black border border-seben-slate rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-seben-stone" size={18} />
              <input
                type="text"
                placeholder="Search order ID, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream placeholder:text-seben-stone rounded focus:border-seben-gold outline-none transition-colors"
              />
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream rounded focus:border-seben-gold outline-none"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-seben-black border border-seben-slate rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-seben-gold" size={40} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto text-seben-stone mb-4" size={48} />
            <p className="text-seben-cream/60">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-seben-charcoal">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">Customer</th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">Date</th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">Total</th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">Status</th>
                  <th className="px-6 py-4 text-right text-xs tracking-wider uppercase text-seben-cream/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-seben-slate">
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-seben-charcoal/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link to={`/admin/orders/${order.id}`} className="text-seben-gold hover:underline font-medium">
                          {order.orderId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-seben-cream text-sm">{order.customerName}</p>
                          <p className="text-seben-cream/60 text-xs">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-seben-cream/60 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-seben-cream text-sm">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="p-2 text-seben-cream/60 hover:text-seben-cream transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-seben-slate">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-seben-charcoal text-seben-cream rounded disabled:opacity-50 hover:bg-seben-slate transition-colors"
            >
              Previous
            </button>
            <span className="text-seben-cream/60 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-seben-charcoal text-seben-cream rounded disabled:opacity-50 hover:bg-seben-slate transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;