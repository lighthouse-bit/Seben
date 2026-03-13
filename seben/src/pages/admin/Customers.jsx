// frontend/src/pages/admin/Customers.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  Users,
  Loader,
  Eye,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [currentPage]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCustomers({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      });
      setCustomers(response.data?.customers || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getCustomerStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load customer stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-seben-cream">Customers</h1>
          <p className="text-seben-cream/60 mt-1">
            {stats?.total || customers.length} registered customers
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-seben-black border border-seben-slate p-6 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-seben-cream/60 text-sm">Total Customers</p>
              <p className="text-2xl font-semibold text-seben-cream mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <Users className="text-seben-gold" size={32} />
          </div>
        </div>
        <div className="bg-seben-black border border-seben-slate p-6 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-seben-cream/60 text-sm">New This Month</p>
              <p className="text-2xl font-semibold text-seben-cream mt-1">
                {stats?.newThisMonth || 0}
              </p>
            </div>
            <Calendar className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-seben-black border border-seben-slate p-6 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-seben-cream/60 text-sm">Active Users (30 days)</p>
              <p className="text-2xl font-semibold text-seben-cream mt-1">
                {stats?.activeUsers || 0}
              </p>
            </div>
            <ShoppingBag className="text-blue-400" size={32} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-seben-black border border-seben-slate rounded p-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-seben-stone" size={18} />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream placeholder:text-seben-stone rounded focus:border-seben-gold outline-none"
          />
        </form>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-seben-gold" size={40} />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-seben-black border border-seben-slate rounded p-12 text-center">
          <Users className="mx-auto text-seben-stone mb-4" size={48} />
          <p className="text-seben-cream/60">No customers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-seben-black border border-seben-slate rounded-lg p-6 hover:border-seben-gold/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-seben-gold rounded-full flex items-center justify-center">
                    <span className="text-seben-black font-medium text-lg">
                      {customer.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-seben-cream font-medium">{customer.name || 'Unknown'}</h3>
                    {customer.ordersCount > 10 && (
                      <span className="text-xs text-seben-gold">VIP Customer</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-seben-cream/60">
                  <Mail size={14} />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-seben-cream/60">
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-seben-cream/60">
                  <Calendar size={14} />
                  <span>Joined {formatDate(customer.createdAt)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-seben-slate grid grid-cols-2 gap-4">
                <div>
                  <p className="text-seben-cream/60 text-xs mb-1">Total Orders</p>
                  <p className="text-seben-cream font-medium">{customer.ordersCount || 0}</p>
                </div>
                <div>
                  <p className="text-seben-cream/60 text-xs mb-1">Total Spent</p>
                  <p className="text-seben-gold font-medium">
                    {formatPrice(customer.totalSpent || 0)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 btn-outline-light btn-sm flex items-center justify-center gap-2">
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-seben-charcoal text-seben-cream rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-seben-cream/60">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-seben-charcoal text-seben-cream rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;