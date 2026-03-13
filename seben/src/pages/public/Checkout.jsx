// frontend/src/pages/public/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Lock,
  Truck,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin
} from 'lucide-react';
import { useCart } from '../../context/CartContex';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import orderService from '../../services/orderService';
import userService from '../../services/userService'; // Import userService
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Checkout = () => {
  const { items, cartTotal, clearCart, addToCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [userAddresses, setUserAddresses] = useState([]); // Store fetched addresses
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch addresses and pre-fill form
  useEffect(() => {
    const initData = async () => {
      if (user) {
        // 1. Basic user info
        setShippingInfo(prev => ({
          ...prev,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || '',
        }));

        // 2. Fetch saved addresses
        try {
          const addresses = await userService.getAddresses();
          setUserAddresses(addresses);

          // Find default address or use the first one
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];

          if (defaultAddress) {
            setShippingInfo(prev => ({
              ...prev,
              firstName: defaultAddress.firstName,
              lastName: defaultAddress.lastName,
              address: defaultAddress.address,
              city: defaultAddress.city,
              state: defaultAddress.state,
              zipCode: defaultAddress.zipCode,
              country: defaultAddress.country,
              // Keep email/phone from user profile if not in address object
              email: user.email || prev.email,
              phone: user.phone || prev.phone
            }));
          }
        } catch (error) {
          console.error("Failed to load addresses", error);
        }
      }
    };

    if (!authLoading) {
      initData();
    }
  }, [user, authLoading]);

  // Handler to select a saved address
  const handleSelectAddress = (address) => {
    setShippingInfo(prev => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    }));
  };

  // ... (keep existing helper functions like shippingCost, formatPrice, handleShippingChange, validateShipping)

  const shippingCost = cartTotal >= 500 ? 0 : 25;
  const tax = cartTotal * 0.089;
  const total = cartTotal + shippingCost + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.firstName) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email) newErrors.email = 'Email is required';
    if (!shippingInfo.phone) newErrors.phone = 'Phone is required';
    if (!shippingInfo.address) newErrors.address = 'Address is required';
    if (!shippingInfo.city) newErrors.city = 'City is required';
    if (!shippingInfo.state) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // DEBUG: Verify User ID
      const currentUserId = user?.id || null;
      console.log("🚀 Placing order for User ID:", currentUserId);

      // Prepare data
      const orderItems = items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images[0],
        productId: item.id,
        size: item.size,
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: shippingInfo,
        customerEmail: shippingInfo.email,
        userId: currentUserId, 
      };

      const pendingOrderData = {
        items: orderItems,
        shippingAddress: shippingInfo,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone,
        userId: currentUserId, 
        cartItems: items,
      };

      localStorage.setItem('pendingOrder', JSON.stringify(pendingOrderData));
      localStorage.setItem('cartBackup', JSON.stringify(items));
      clearCart();

      await orderService.createCheckoutSession(orderData);
      
    } catch (error) {
      console.error(error);
      toast.error('Payment initialization failed');
      
      const backup = localStorage.getItem('cartBackup');
      if (backup && items.length === 0) {
         const savedItems = JSON.parse(backup);
         savedItems.forEach(item => addToCart(item, item.quantity, item.size));
      }
      
      setIsProcessing(false);
    }
  };

  if (authLoading) return <LoadingSpinner fullScreen />;

  if (items.length === 0 && !isProcessing) {
    const isCanceled = new URLSearchParams(window.location.search).get('canceled');
    if (isCanceled) {
       return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /><p className="ml-4">Restoring your cart...</p></div>;
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-seben-black/60">Your cart is empty.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary">Go Shop</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-seben-cream py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[{ num: 1, label: 'Shipping' }, { num: 2, label: 'Payment' }].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-colors ${step >= s.num ? 'bg-seben-gold text-seben-black' : 'bg-seben-cream-dark text-seben-black/40'}`}>
                    {step > s.num ? <Check size={20} /> : s.num}
                  </div>
                  <span className="text-sm mt-2 text-seben-black/60">{s.label}</span>
                </div>
                {index < 1 && <div className={`w-24 h-[2px] mx-4 transition-colors ${step > s.num ? 'bg-seben-gold' : 'bg-seben-cream-dark'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded">
                <div className="flex items-center gap-3 mb-8">
                  <Truck className="text-seben-gold" size={24} />
                  <h2 className="text-2xl font-serif">Shipping Information</h2>
                </div>

                {/* Saved Addresses Section */}
                {userAddresses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-seben-black/60 mb-3 uppercase tracking-wider">Saved Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userAddresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-4 border rounded cursor-pointer transition-all ${
                            shippingInfo.address === addr.address && shippingInfo.zipCode === addr.zipCode
                              ? 'border-seben-gold bg-seben-gold/5'
                              : 'border-seben-black/10 hover:border-seben-black/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-seben-gold mt-1" />
                            <div>
                              <p className="font-medium text-sm">{addr.firstName} {addr.lastName}</p>
                              <p className="text-sm text-seben-black/60">{addr.address}</p>
                              <p className="text-sm text-seben-black/60">{addr.city}, {addr.state} {addr.zipCode}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">First Name *</label>
                    <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleShippingChange} className={`input ${errors.firstName ? 'border-red-500' : ''}`} />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleShippingChange} className={`input ${errors.lastName ? 'border-red-500' : ''}`} />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" name="email" value={shippingInfo.email} onChange={handleShippingChange} className={`input ${errors.email ? 'border-red-500' : ''}`} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} className={`input ${errors.phone ? 'border-red-500' : ''}`} />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Address *</label>
                    <input type="text" name="address" value={shippingInfo.address} onChange={handleShippingChange} className={`input ${errors.address ? 'border-red-500' : ''}`} />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="label">City *</label>
                    <input type="text" name="city" value={shippingInfo.city} onChange={handleShippingChange} className={`input ${errors.city ? 'border-red-500' : ''}`} />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input type="text" name="state" value={shippingInfo.state} onChange={handleShippingChange} className={`input ${errors.state ? 'border-red-500' : ''}`} />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="label">ZIP Code *</label>
                    <input type="text" name="zipCode" value={shippingInfo.zipCode} onChange={handleShippingChange} className={`input ${errors.zipCode ? 'border-red-500' : ''}`} />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded">
                <div className="flex items-center gap-3 mb-8">
                  <CreditCard className="text-seben-gold" size={24} />
                  <h2 className="text-2xl font-serif">Payment Method</h2>
                </div>
                <div className="mb-6 p-4 bg-seben-cream-dark rounded flex items-start gap-3">
                  <Lock className="text-seben-gold shrink-0 mt-1" size={20} />
                  <p className="text-sm text-seben-black/70">You will be redirected to Stripe to securely complete your payment.</p>
                </div>
                <div className="bg-seben-cream-dark/50 p-4 rounded border border-seben-black/5 mb-6">
                  <h3 className="font-medium mb-2">Shipping To:</h3>
                  <p className="text-sm text-seben-black/70">
                    {shippingInfo.firstName} {shippingInfo.lastName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                    {shippingInfo.country}
                  </p>
                  <button onClick={() => setStep(1)} className="text-xs text-seben-gold mt-2 hover:underline">Edit Shipping</button>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 btn-outline flex items-center justify-center gap-2" disabled={isProcessing}>
                  <ArrowLeft size={20} /> Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={handleNext} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  Continue <ArrowRight size={20} />
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={isProcessing} className="flex-1 btn-gold flex items-center justify-center gap-2">
                  {isProcessing ? <><LoadingSpinner size={20} /> Redirecting...</> : <><Lock size={20} /> Pay Now</>}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded sticky top-32">
              <h3 className="text-lg font-medium mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.cartId} className="flex gap-4">
                    <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-seben-black/60">Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                      <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-seben-black/60">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-seben-black/60">Shipping</span><span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-seben-black/60">Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="border-t pt-3 flex justify-between font-medium text-lg"><span>Total</span><span className="text-seben-gold">{formatPrice(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;