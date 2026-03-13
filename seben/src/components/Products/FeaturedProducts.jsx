// src/components/Products/FeaturedProducts.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../ProductCard/ProductCard'
import { products } from '../../data/products'

const FeaturedProducts = () => {
  const featuredProducts = products.filter(p => p.featured)

  return (
    <section className="py-24 bg-seben-cream">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-seben-gold text-sm tracking-[0.3em] uppercase mb-4">
            Curated Selection
          </p>
          <h2 className="text-4xl lg:text-5xl font-serif text-seben-black mb-6">
            Featured Collection
          </h2>
          <div className="w-24 h-[1px] bg-seben-gold mx-auto" />
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 text-seben-black hover:text-seben-gold transition-colors group"
          >
            <span className="text-sm tracking-widest uppercase">View All Collections</span>
            <ArrowRight 
              size={18} 
              className="group-hover:translate-x-2 transition-transform" 
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedProducts