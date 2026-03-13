// src/components/UI/LuxuryBanner.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const LuxuryBanner = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920)' 
        }}
      >
        <div className="absolute inset-0 bg-seben-black/70" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-seben-gold text-sm tracking-[0.3em] uppercase mb-6">
            The Seben Experience
          </p>
          
          <h2 className="text-4xl lg:text-6xl font-serif text-seben-cream mb-8 leading-tight">
            Where Luxury Meets
            <span className="block italic text-seben-gold">Timeless Elegance</span>
          </h2>
          
          <p className="text-seben-cream/70 text-lg mb-10 text-luxury max-w-xl mx-auto">
            Every piece in our collection is a testament to exceptional craftsmanship, 
            premium materials, and enduring design philosophy.
          </p>
          
          <Link to="/shop" className="btn-luxury-outline !border-seben-cream !text-seben-cream hover:!bg-seben-cream hover:!text-seben-black">
            Discover More
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default LuxuryBanner