// frontend/src/pages/public/Account/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import orderService from '../../../services/orderService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'processing':
        return <Package className="text-blue-500" size={20} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-500">Error loading orders: {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Package className="mx-auto text-seben-black/20 mb-4" size={64} />
        <h3 className="text-xl font-serif text-seben-black mb-2">No Orders Yet</h3>
        <p className="text-seben-black/60 mb-6">
          When you make your first purchase, it will appear here.
        </p>
        <Link to="/shop" className="btn-primary inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-serif text-seben-black mb-6">Order History</h2>
        
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-seben-black/10 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-seben-black mb-1">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-seben-black/60">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-seben-cream rounded overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-seben-black/20" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-seben-black">{item.name}</p>
                      <p className="text-xs text-seben-black/60">
                        Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-seben-black/60">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-seben-black/10">
                <div>
                  <p className="text-sm text-seben-black/60">Total</p>
                  <p className="text-lg font-medium text-seben-black">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="flex items-center gap-2 text-seben-gold hover:text-seben-gold-dark transition-colors"
                >
                  <span className="text-sm font-medium">View Details</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-seben-black/10">
                  <p className="text-sm text-seben-black/60">
                    Tracking: <span className="font-medium text-seben-black">{order.trackingNumber}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;