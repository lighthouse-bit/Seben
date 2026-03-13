// frontend/src/pages/public/Account/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Download,
  XCircle,
} from 'lucide-react';
import orderService from '../../../services/orderService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="text-yellow-500" size={24} />;
      case 'processing':
        return <Package className="text-blue-500" size={24} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Clock className="text-gray-500" size={24} />;
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-500 mb-4">Order not found</p>
        <button onClick={() => navigate('/account/orders')} className="btn-outline">
          Back to Orders
        </button>
      </div>
    );
  }

  const timeline = [
    { status: 'PENDING', label: 'Order Placed', date: order.createdAt },
    { status: 'PROCESSING', label: 'Processing', date: null },
    { status: 'SHIPPED', label: 'Shipped', date: null },
    { status: 'DELIVERED', label: 'Delivered', date: order.deliveredAt },
  ];

  const currentIndex = timeline.findIndex(t => t.status === order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/account/orders')}
            className="flex items-center gap-2 text-seben-black/60 hover:text-seben-black transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </button>
          <button className="btn-outline btn-sm flex items-center gap-2">
            <Download size={16} />
            Download Invoice
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-serif text-seben-black mb-2">
              Order #{order.orderId}
            </h1>
            <p className="text-seben-black/60">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-serif text-seben-black mb-6">Order Status</h2>
        
        <div className="relative">
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-seben-black/10" />
          {timeline.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = step.status === order.status;

            return (
              <div key={step.status} className="relative flex items-start gap-6 pb-8 last:pb-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted
                      ? 'bg-seben-gold text-seben-black'
                      : 'bg-white border-2 border-seben-black/20 text-seben-black/40'
                  }`}
                >
                  {isCompleted ? <CheckCircle size={16} /> : index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-medium ${isCompleted ? 'text-seben-black' : 'text-seben-black/40'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-sm text-seben-black/60 mt-1">
                      {formatDate(step.date)}
                    </p>
                  )}
                  {isCurrent && (
                    <span className="inline-block mt-2 text-xs text-seben-gold">
                      Current Status
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tracking Number */}
        {order.trackingNumber && (
          <div className="mt-6 pt-6 border-t border-seben-black/10">
            <p className="text-sm text-seben-black/60 mb-1">Tracking Number</p>
            <p className="font-medium text-seben-black">{order.trackingNumber}</p>
            {order.carrier && (
              <p className="text-sm text-seben-black/60 mt-1">Carrier: {order.carrier}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-serif text-seben-black mb-6">Order Items</h2>
        
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-seben-black/10 last:border-0">
              <div className="w-20 h-20 bg-seben-cream rounded overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="text-seben-black/20" size={32} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-seben-black">{item.name}</h3>
                <p className="text-sm text-seben-black/60">
                  Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                </p>
                <p className="text-sm text-seben-black/60 mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-seben-black">
                  {formatPrice(parseFloat(item.price) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-seben-black/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-seben-black/60">Subtotal</span>
            <span className="text-seben-black">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-seben-black/60">Shipping</span>
            <span className="text-seben-black">
              {parseFloat(order.shipping) === 0 ? 'Free' : formatPrice(order.shipping)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-seben-black/60">Tax</span>
            <span className="text-seben-black">{formatPrice(order.tax)}</span>
          </div>
          {parseFloat(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-medium pt-2 border-t border-seben-black/10">
            <span className="text-seben-black">Total</span>
            <span className="text-seben-gold">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-seben-gold" size={20} />
            <h3 className="font-medium text-seben-black">Shipping Address</h3>
          </div>
          <div className="text-sm text-seben-black/70 space-y-1">
            <p>{order.customerName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-seben-black/10 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-seben-black/40" />
              <span className="text-seben-black/70">{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-seben-black/40" />
              <span className="text-seben-black/70">{order.customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-seben-gold" size={20} />
            <h3 className="font-medium text-seben-black">Payment Method</h3>
          </div>
          <div className="text-sm text-seben-black/70">
            <p className="mb-2">{order.paymentMethod}</p>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Paid
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-seben-cream rounded-lg p-6 text-center">
        <h3 className="font-serif text-lg text-seben-black mb-2">Need Help?</h3>
        <p className="text-seben-black/60 mb-4">
          If you have any questions about your order, please don't hesitate to contact us.
        </p>
        <Link to="/contact" className="btn-outline btn-sm inline-block">
          Contact Support
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderDetail;