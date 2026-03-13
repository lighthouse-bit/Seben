// frontend/src/pages/public/Shop.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid, LayoutGrid } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useProducts } from '../../hooks/useProducts';

const Shop = () => {
  const { category } = useParams();
  const [sortBy, setSortBy] = useState('createdAt');
  const [gridCols, setGridCols] = useState(3);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filters = {
    category: category || '',
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    search: searchQuery,
    sortBy: sortBy.split('-')[0],
    order: sortBy.includes('high') || sortBy.includes('new') ? 'desc' : 'asc',
    page: currentPage,
    limit: 12,
  };

  const { products, loading, error, pagination } = useProducts(filters);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (min, max) => {
    setPriceRange([min, max]);
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading products</p>
          <p className="text-seben-black/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Page Header */}
      <div className="bg-seben-charcoal text-seben-cream py-20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-seben-gold text-sm tracking-[0.3em] uppercase mb-4"
          >
            Collections
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-serif capitalize"
          >
            {category || 'All Products'}
          </motion.h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-28 z-30 bg-seben-cream border-b border-seben-black/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 text-sm tracking-wider uppercase hover:text-seben-gold transition-colors"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>

            <p className="text-seben-black/60 text-sm hidden md:block">
              {pagination.total} Products
            </p>

            <div className="flex items-center gap-6">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-transparent text-sm tracking-wider uppercase outline-none cursor-pointer"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name</option>
              </select>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 ${gridCols === 2 ? 'text-seben-gold' : 'text-seben-black/40'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 ${gridCols === 3 ? 'text-seben-gold' : 'text-seben-black/40'}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex gap-12">
          {/* Sidebar Filters */}
          {isFilterOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 shrink-0"
            >
              <div className="sticky top-44 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-sm tracking-widest uppercase mb-4">Categories</h3>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="/shop"
                        className={`text-sm ${
                          !category ? 'text-seben-gold' : 'text-seben-black/60 hover:text-seben-black'
                        } transition-colors`}
                      >
                        All Products
                      </a>
                    </li>
                    {['suits', 'watches', 'leather', 'footwear', 'grooming', 'accessories'].map((cat) => (
                      <li key={cat}>
                        <a
                          href={`/shop/${cat}`}
                          className={`text-sm capitalize ${
                            category === cat 
                              ? 'text-seben-gold' 
                              : 'text-seben-black/60 hover:text-seben-black'
                          } transition-colors`}
                        >
                          {cat}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm tracking-widest uppercase mb-4">Price Range</h3>
                  <div className="space-y-3">
                    {[
                      [0, 500],
                      [500, 1000],
                      [1000, 5000],
                      [5000, 10000],
                      [10000, 50000],
                    ].map(([min, max]) => (
                      <label key={`${min}-${max}`} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange[0] === min && priceRange[1] === max}
                          onChange={() => handlePriceChange(min, max)}
                          className="accent-seben-gold"
                        />
                        <span className="text-sm text-seben-black/60">
                          ${min.toLocaleString()} - ${max.toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridCols} gap-8`}>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-seben-black/60">No products found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-seben-black disabled:opacity-30"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 ${
                      currentPage === i + 1 
                        ? 'bg-seben-black text-seben-cream' 
                        : 'hover:bg-seben-black/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-seben-black disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Shop;