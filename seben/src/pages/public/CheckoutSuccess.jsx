// frontend/src/pages/public/CheckoutSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import orderService from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart(); 
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  // 1. Initial Effect: Verify Payment
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const pendingOrderStr = localStorage.getItem('pendingOrder');

    if (sessionId && pendingOrderStr) {
      const pendingOrder = JSON.parse(pendingOrderStr);
      verifyOrder(sessionId, pendingOrder);
    } else if (sessionId) {
      // If we have a session ID but lost local storage (rare), try to fetch just by session
      // For now, redirect to home to be safe
      navigate('/');
    } else {
      navigate('/');
    }
  }, []);

  const verifyOrder = async (sessionId, pendingOrder) => {
    try {
      const createdOrder = await orderService.verifyPayment(sessionId, {
        orderData: pendingOrder
      });
      
      setOrder(createdOrder);
      
      // SUCCESS!
      toast.success('Payment successful! Order placed.');
      
      // Perform cleanup
      handleCleanup();

    } catch (error) {
      console.error('Order verification failed:', error);
      
      // Handle duplicates (if user refreshed page)
      if (error.response?.status === 200 || error.message?.includes('already exists')) {
         handleCleanup(); // Still clear cart if order exists
      } else {
         toast.error('Failed to verify payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = () => {
    console.log("🧹 Cleanup: Wiping cart and pending order...");
    
    // 1. Clear Context
    clearCart();
    
    // 2. Clear Local Storage explicitly
    localStorage.removeItem('pendingOrder');
    localStorage.removeItem('seben-cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-seben-cream">
        <Loader className="animate-spin text-seben-gold" size={48} />
        <p className="text-seben-black/60">Finalizing your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-seben-cream px-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="text-green-600" size={40} />
      </div>
      
      <h1 className="text-3xl font-serif text-seben-black mb-2">Thank You!</h1>
      <p className="text-seben-black/60 mb-8 max-w-md">
        Your order <strong>#{order?.orderId}</strong> has been placed successfully. 
        We've sent a confirmation email to {order?.customerEmail}.
      </p>

      <div className="flex gap-4">
        <Link to="/account/orders" className="btn-outline">
          View Order
        </Link>
        <Link to="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;