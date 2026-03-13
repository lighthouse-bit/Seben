// src/components/Categories/Categories.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categories } from '../../data/products'

const Categories = () => {
  const displayCategories = categories.filter(c => c.id !== 'all')

  return (
    <section className="py-24 bg-seben-cream-dark">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-seben-gold text-sm tracking-[0.3em] uppercase mb-4">
            Explore
          </p>
          <h2 className="text-4xl lg:text-5xl font-serif text-seben-black mb-6">
            Shop by Category
          </h2>
          <div className="w-24 h-[1px] bg-seben-gold mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/shop/${category.id}`}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-seben-black/80 via-seben-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-serif text-seben-cream mb-2">
                    {category.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-seben-gold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories