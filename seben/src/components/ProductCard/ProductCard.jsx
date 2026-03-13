// frontend/src/components/ProductCard/ProductCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContex';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils'; 

const ProductCard = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const toast = useToast();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.sizes && product.sizes.length > 0) {
      toast.info('Please select a size');
    } else {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        images: product.images?.map(img => getImageUrl(img)) || [],
        category: product.category,
        sku: product.sku,
      };
      
      addToCart(cartProduct, 1);
      toast.success(`${product.name} added to cart`);
    }
  };

  // Get images safely
  const mainImage = getImageUrl(product.images?.find(img => img.isMain) || product.images?.[0]);
  const secondaryImage = product.images?.[1] ? getImageUrl(product.images[1]) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Verify this ID exists in your database */}
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-seben-cream-dark mb-4">
          <motion.img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6 }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x500?text=Error';
            }}
          />
          
          {secondaryImage && (
            <motion.img
              src={secondaryImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Badges and Quick Action Buttons */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.originalPrice && (
              <span className="bg-seben-black text-seben-cream px-3 py-1 text-xs tracking-widest">SALE</span>
            )}
            {product.new && (
              <span className="bg-seben-gold text-seben-black px-3 py-1 text-xs tracking-widest">NEW</span>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 flex gap-2"
          >
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-seben-black text-seben-cream py-3 flex items-center justify-center gap-2 hover:bg-seben-gold hover:text-seben-black transition-colors text-sm tracking-wider"
            >
              <ShoppingBag size={16} />
              {product.sizes?.length > 0 ? 'Select Options' : 'Add to Cart'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              className="p-3 bg-seben-cream text-seben-black hover:bg-seben-gold transition-colors"
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </motion.div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-seben-black/60 tracking-widest uppercase">{product.category}</p>
          <h3 className="font-serif text-lg text-seben-black group-hover:text-seben-gold transition-colors">{product.name}</h3>
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-seben-black/40 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;