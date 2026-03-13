// frontend/src/pages/public/Account/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useCart } from '../../../context/CartContex';
import userService from '../../../services/userService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getWishlist();
      setWishlist(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await userService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = (item) => {
    const product = item.product;
    
    // Check if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      // Redirect to product page to select size
      window.location.href = `/product/${product.id}`;
      return;
    }

    // Format product for cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      images: product.images?.map(img => img.url) || [],
      category: product.category,
      sku: product.sku,
    };

    addToCart(cartProduct, 1);
    toast.success(`${product.name} added to cart`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
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
        <p className="text-red-500">Error loading wishlist: {error}</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Heart className="mx-auto text-seben-black/20 mb-4" size={64} />
        <h3 className="text-xl font-serif text-seben-black mb-2">Your Wishlist is Empty</h3>
        <p className="text-seben-black/60 mb-6">
          Save your favorite items to keep track of what you love.
        </p>
        <Link to="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-seben-black">
            My Wishlist ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {wishlist.map((item, index) => {
              const product = item.product;
              const mainImage = product.images?.find(img => img.isMain)?.url || 
                               product.images?.[0]?.url || 
                               'https://via.placeholder.com/400x500';

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-seben-black/10 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-seben-cream">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromWishlist(product.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <X size={18} className="text-red-600" />
                    </button>

                    {/* Badges */}
                    {product.new && (
                      <span className="absolute top-4 left-4 bg-seben-gold text-seben-black px-3 py-1 text-xs tracking-widest">
                        NEW
                      </span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <p className="text-xs text-seben-black/60 tracking-widest uppercase mb-1">
                        {product.category?.toLowerCase()}
                      </p>
                      <h3 className="font-serif text-lg text-seben-black mb-2 group-hover:text-seben-gold transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-medium text-seben-black">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-seben-black/40 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 btn-primary btn-sm flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="p-2 border border-seben-black/20 rounded hover:border-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;