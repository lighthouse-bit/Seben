// frontend/src/pages/public/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, Check, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContex'; 
import { useProduct } from '../../hooks/useProducts';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUtils';
import userService from '../../services/userService'; 
const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { addToCart } = useCart();
  const toast = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false); // Wishlist state

  // Check if product is in wishlist on load
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const wishlist = await userService.getWishlist();
        // Assuming wishlist returns an array of objects like { productId: "...", ... }
        const exists = wishlist.some(item => item.productId === id);
        setIsWishlisted(exists);
      } catch (e) {
        // Ignore errors (e.g. not logged in)
      }
    };
    if (id) checkWishlist();
  }, [id]);

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await userService.removeFromWishlist(product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await userService.addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Please login to use wishlist');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (error || !product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif">Product Not Found</h2>
        <p className="text-seben-black/60">The product you are looking for does not exist.</p>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.info('Please select a size'); // Use toast instead of alert
      return;
    }
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      images: product.images?.map(img => getImageUrl(img)) || [],
      category: product.category,
      sku: product.sku,
    };

    addToCart(cartProduct, quantity, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const images = product.images || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 lg:px-12 py-6">
        <nav className="flex items-center gap-2 text-sm text-seben-black/60">
          <Link to="/" className="hover:text-seben-black">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-seben-black">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-seben-black truncate">{product.name}</span>
        </nav>
      </div>

      <section className="container mx-auto px-6 lg:px-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-seben-cream-dark overflow-hidden rounded-lg">
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-24 flex-shrink-0 border-2 rounded ${
                      selectedImage === index ? 'border-seben-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:py-12">
            <h1 className="text-3xl lg:text-4xl font-serif text-seben-black mb-4">{product.name}</h1>
            <p className="text-2xl font-medium mb-6">${product.price}</p>
            <p className="text-seben-black/70 mb-8 leading-relaxed">{product.description}</p>

            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-bold mb-3 uppercase">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(s => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      disabled={s.stock === 0}
                      className={`w-12 h-12 border flex items-center justify-center text-sm transition-all ${
                        selectedSize === s.size 
                          ? 'bg-seben-gold text-white border-seben-gold' 
                          : 'border-gray-300 hover:border-seben-gold'
                      } ${s.stock === 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Add to Cart & Wishlist */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stockCount === 0}
                className={`flex-1 py-4 flex items-center justify-center gap-3 font-medium uppercase tracking-widest text-sm transition-all rounded ${
                  addedToCart ? 'bg-green-600 text-white' : 'bg-seben-black text-seben-cream hover:bg-seben-gold hover:text-black'
                }`}
              >
                {product.stockCount === 0 ? 'Out of Stock' : addedToCart ? (
                  <>
                    <Check size={18} /> Added to Bag
                  </>
                ) : 'Add to Bag'}
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`w-14 flex items-center justify-center border rounded transition-colors ${
                  isWishlisted
                    ? 'border-seben-gold bg-seben-gold text-white'
                    : 'border-seben-black/20 hover:border-seben-black'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ProductDetail;