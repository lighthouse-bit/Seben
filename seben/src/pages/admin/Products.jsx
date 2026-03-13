// frontend/src/pages/admin/Products.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  Loader,
  AlertTriangle,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, [filterCategory, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllProducts({
        category: filterCategory !== 'all' ? filterCategory : '',
        page: currentPage,
        limit: 10,
      });
      setProducts(response.data?.products || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    
    setDeleting(true);
    try {
      await adminService.deleteProduct(deleteModal.product.id);
      toast.success(`${deleteModal.product.name} deleted successfully`);
      setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id));
      setDeleteModal({ open: false, product: null });
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

    const getMainImage = (product) => {
      const url = product.images?.find(img => img.isMain)?.url || 
                  product.images?.[0]?.url || 
                  'https://via.placeholder.com/100';
      
      if (url.startsWith('http')) return url;
      return `${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`;
    };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-seben-cream">Products</h1>
          <p className="text-seben-cream/60 mt-1">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-gold flex items-center gap-2">
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-seben-black border border-seben-slate rounded p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-seben-stone" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream placeholder:text-seben-stone rounded focus:border-seben-gold outline-none"
              />
            </div>
          </form>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream rounded focus:border-seben-gold outline-none"
          >
            <option value="all">All Categories</option>
            <option value="SUITS">Suits</option>
            <option value="WATCHES">Watches</option>
            <option value="LEATHER">Leather</option>
            <option value="FOOTWEAR">Footwear</option>
            <option value="GROOMING">Grooming</option>
            <option value="ACCESSORIES">Accessories</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-seben-black border border-seben-slate rounded overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-seben-gold" size={40} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto text-seben-stone mb-4" size={48} />
            <p className="text-seben-cream/60">No products found</p>
            <Link to="/admin/products/new" className="btn-gold mt-4 inline-flex items-center gap-2">
              <Plus size={16} />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-seben-charcoal">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-seben-cream/60">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs tracking-wider uppercase text-seben-cream/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-seben-slate">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-seben-charcoal/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={getMainImage(product)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-seben-cream font-medium">{product.name}</p>
                          {product.new && (
                            <span className="text-xs text-seben-gold">NEW</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-seben-cream/70 text-sm">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-seben-charcoal text-seben-cream text-xs rounded capitalize">
                        {product.category?.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-seben-cream text-sm">
                      {formatPrice(product.price)}
                      {product.originalPrice && (
                        <span className="text-seben-cream/40 line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          product.stockCount > 10
                            ? 'text-green-400'
                            : product.stockCount > 0
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {product.stockCount} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          product.inStock
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          className="p-2 text-seben-cream/60 hover:text-seben-cream transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 text-seben-cream/60 hover:text-seben-gold transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, product })}
                          className="p-2 text-seben-cream/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => !deleting && setDeleteModal({ open: false, product: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-seben-charcoal border border-seben-slate rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-serif text-seben-cream">Delete Product</h3>
              </div>
              <p className="text-seben-cream/70 mb-6">
                Are you sure you want to delete <strong>"{deleteModal.product?.name}"</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal({ open: false, product: null })}
                  className="flex-1 btn-outline-light"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? <Loader className="animate-spin" size={16} /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;