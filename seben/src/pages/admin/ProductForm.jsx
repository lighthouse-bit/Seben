// frontend/src/pages/admin/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  X,
  Save,
  Loader,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    price: '',
    originalPrice: '',
    description: '',
    stockCount: 0,
    featured: false,
    new: false,
    inStock: true,
    materials: [],
    origin: '',
    brand: 'SEBEN',
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [details, setDetails] = useState(['']);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [sizes, setSizes] = useState([]);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'SUITS', label: 'Suits & Tailoring' },
    { value: 'WATCHES', label: 'Timepieces' },
    { value: 'LEATHER', label: 'Leather Goods' },
    { value: 'FOOTWEAR', label: 'Footwear' },
    { value: 'GROOMING', label: 'Grooming' },
    { value: 'ACCESSORIES', label: 'Accessories' },
  ];

  const sizeOptions = {
    SUITS: ['44', '46', '48', '50', '52', '54', '56'],
    FOOTWEAR: ['39', '40', '41', '42', '43', '44', '45', '46'],
    GROOMING: ['50ml', '100ml', '150ml', '200ml'],
  };

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await adminService.getProductById(id);
      
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        description: product.description || '',
        stockCount: product.stockCount || 0,
        featured: product.featured || false,
        new: product.new || false,
        inStock: product.inStock !== false,
        materials: product.materials || [],
        origin: product.origin || '',
        brand: product.brand || 'SEBEN',
      });

      if (product.images?.length > 0) {
        // For existing images, we treat them as URLs
        const existingImages = product.images.map(img => ({
          url: img.url,
          isMain: img.isMain,
          id: img.id
        }));
        setImages(existingImages);
        setPreviews(existingImages.map(img => img.url));
      }

      if (product.details?.length > 0) {
        setDetails(product.details.map(d => d.detail || d));
      }

      if (product.specifications?.length > 0) {
        setSpecifications(product.specifications.map(s => ({ key: s.key, value: s.value })));
      }

      if (product.sizes?.length > 0) {
        setSizes(product.sizes.map(s => ({ size: s.size, stock: s.stock })));
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    // Add new files to images array (these are File objects)
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs for display
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Clear image error if exists
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index) => {
    // This just reorders the arrays so the selected index becomes first
    const newImages = [...images];
    const selectedImage = newImages.splice(index, 1)[0];
    newImages.unshift(selectedImage);
    setImages(newImages);

    const newPreviews = [...previews];
    const selectedPreview = newPreviews.splice(index, 1)[0];
    newPreviews.unshift(selectedPreview);
    setPreviews(newPreviews);
  };

  const handleDetailChange = (index, value) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
  };

  const addDetail = () => setDetails([...details, '']);
  const removeDetail = (index) => setDetails(details.filter((_, i) => i !== index));

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const removeSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

  const toggleSize = (size) => {
    const existing = sizes.find(s => s.size === size);
    if (existing) {
      setSizes(sizes.filter(s => s.size !== size));
    } else {
      setSizes([...sizes, { size, stock: 5 }]);
    }
  };

  const updateSizeStock = (size, stock) => {
    setSizes(sizes.map(s => s.size === size ? { ...s, stock: parseInt(stock) || 0 } : s));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    
    try {
      // 1. Upload new images first
      let processedImages = [];
      const newFiles = images.filter(img => img instanceof File);
      const existingImages = images.filter(img => !(img instanceof File));
      
      if (newFiles.length > 0) {
        setUploading(true);
        const uploadFormData = new FormData();
        newFiles.forEach(file => {
          uploadFormData.append('images', file);
        });

        // Use direct API call for upload to handle FormData
        const uploadRes = await api.post('/uploads', uploadFormData);
        const uploadedFiles = uploadRes.data?.files || [];
        
        // Combine uploaded files with existing ones
        processedImages = [
          ...existingImages,
          ...uploadedFiles.map(file => ({ url: file.url, isMain: false }))
        ];
      } else {
        processedImages = existingImages;
      }

      // Ensure the first image is main if none specified
      if (processedImages.length > 0) {
        processedImages = processedImages.map((img, idx) => ({
          ...img,
          isMain: idx === 0,
          order: idx
        }));
      }

      // 2. Prepare Product Data
      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        subcategory: formData.subcategory || null,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        description: formData.description.trim(),
        stockCount: parseInt(formData.stockCount) || 0,
        featured: formData.featured,
        new: formData.new,
        inStock: formData.inStock,
        materials: formData.materials.filter(m => m.trim()),
        origin: formData.origin || null,
        brand: formData.brand || 'SEBEN',
        images: processedImages,
        details: details.filter(d => d.trim()).map((detail, index) => ({
          detail: detail.trim(),
          order: index,
        })),
        specifications: specifications.filter(s => s.key.trim() && s.value.trim()),
        sizes: sizes.filter(s => s.size),
      };

      // 3. Create/Update Product
      if (isEdit) {
        await adminService.updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        await adminService.createProduct(productData);
        toast.success('Product created successfully');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-seben-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 text-seben-cream/60 hover:text-seben-cream transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-serif text-seben-cream">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-seben-cream/60 mt-1">
            {isEdit ? 'Update product information' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <h2 className="text-lg font-medium text-seben-cream mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="label-dark">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-dark ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Classic Oxford Shoes"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-dark">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`input-dark ${errors.sku ? 'border-red-500' : ''}`}
                placeholder="e.g. SEB-SHO-001"
              />
              {errors.sku && <p className="text-red-400 text-sm mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="label-dark">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-dark ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="label-dark">Subcategory</label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="input-dark"
                placeholder="e.g. dress-shoes"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label-dark">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`input-dark ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Detailed product description..."
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Local Image Upload */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <h2 className="text-lg font-medium text-seben-cream mb-6">Product Images</h2>
          {errors.images && <p className="text-red-400 text-sm mb-4">{errors.images}</p>}
          
          <div className="space-y-4">
            {/* Upload Area */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-seben-slate rounded-lg cursor-pointer hover:border-seben-gold transition-colors bg-seben-charcoal/30">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-seben-gold mb-2" />
                <p className="text-sm text-seben-cream/60">Click to upload images</p>
                <p className="text-xs text-seben-cream/40 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading || saving}
              />
            </label>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover rounded-lg border border-seben-slate"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-seben-gold text-seben-black text-xs px-2 py-1 rounded font-medium">
                        Main
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        className="p-2 bg-seben-cream text-seben-black rounded hover:bg-seben-gold transition-colors text-xs"
                        title="Set as Main"
                      >
                        Main
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {(uploading || saving) && (
              <div className="flex items-center gap-2 text-seben-gold text-sm mt-2">
                <Loader className="animate-spin" size={16} />
                <span>{uploading ? 'Uploading images...' : 'Saving product...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <h2 className="text-lg font-medium text-seben-cream mb-6">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="label-dark">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`input-dark ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="label-dark">Original Price ($)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="input-dark"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="label-dark">Stock Count</label>
              <input
                type="number"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleChange}
                className="input-dark"
                min="0"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-seben-cream cursor-pointer">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="w-5 h-5 accent-seben-gold rounded"
              />
              In Stock
            </label>
            <label className="flex items-center gap-3 text-seben-cream cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 accent-seben-gold rounded"
              />
              Featured Product
            </label>
            <label className="flex items-center gap-3 text-seben-cream cursor-pointer">
              <input
                type="checkbox"
                name="new"
                checked={formData.new}
                onChange={handleChange}
                className="w-5 h-5 accent-seben-gold rounded"
              />
              New Arrival
            </label>
          </div>
        </div>

        {/* Sizes */}
        {sizeOptions[formData.category] && (
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <h2 className="text-lg font-medium text-seben-cream mb-6">Available Sizes</h2>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {sizeOptions[formData.category].map(size => {
                const isSelected = sizes.some(s => s.size === size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 border-2 rounded transition-colors ${
                      isSelected
                        ? 'bg-seben-gold text-seben-black border-seben-gold'
                        : 'border-seben-slate text-seben-cream hover:border-seben-gold'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {sizes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sizes.map(s => (
                  <div key={s.size} className="flex items-center gap-2">
                    <span className="text-seben-cream text-sm w-16">{s.size}:</span>
                    <input
                      type="number"
                      value={s.stock}
                      onChange={(e) => updateSizeStock(s.size, e.target.value)}
                      className="input-dark flex-1"
                      placeholder="Stock"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Details */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <h2 className="text-lg font-medium text-seben-cream mb-6">Product Details</h2>
          
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => handleDetailChange(index, e.target.value)}
                  className="input-dark flex-1"
                  placeholder="e.g. Made from premium Italian leather"
                />
                {details.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addDetail}
              className="btn-outline-light btn-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add Detail
            </button>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <h2 className="text-lg font-medium text-seben-cream mb-6">Specifications</h2>
          
          <div className="space-y-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  className="input-dark w-1/3"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  className="input-dark flex-1"
                  placeholder="Value"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSpec}
              className="btn-outline-light btn-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add Specification
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex-1 btn-outline-light"
            disabled={saving || uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn-gold flex items-center justify-center gap-2"
            disabled={saving || uploading}
          >
            {saving || uploading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;