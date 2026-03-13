// src/pages/public/About.jsx
import { motion } from 'framer-motion'
import { Award, Shield, Truck, Heart } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: Award,
      title: 'Exceptional Quality',
      description: 'Every piece is meticulously crafted from the finest materials by master artisans.',
    },
    {
      icon: Shield,
      title: 'Authenticity Guaranteed',
      description: 'All products come with certificates of authenticity and comprehensive warranties.',
    },
    {
      icon: Truck,
      title: 'White Glove Service',
      description: 'Premium packaging and complimentary shipping on orders over $500.',
    },
    {
      icon: Heart,
      title: 'Built to Last',
      description: 'Timeless designs that transcend trends, crafted for generations.',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero */}
      <section
        className="relative h-[60vh] min-h-[500px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seben-black via-seben-black/80 to-transparent" />
        <div className="relative container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <p className="overline text-seben-gold mb-4">Since 2024</p>
            <h1 className="text-5xl lg:text-6xl font-serif text-seben-cream mb-6">
              Redefining Luxury for the Modern Gentleman
            </h1>
            <p className="text-seben-cream/80 text-lg text-luxury">
              SEBEN represents the pinnacle of masculine elegance, offering a curated selection
              of the world's finest goods for the discerning man.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-seben-cream">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="overline text-seben-gold mb-4">Our Story</p>
              <h2 className="text-4xl font-serif mb-6">
                A Legacy of Excellence
              </h2>
              <div className="space-y-4 text-seben-black/70 text-luxury">
                <p>
                  SEBEN was founded with a singular vision: to provide the modern gentleman
                  with access to the world's most exceptional products. From handcrafted
                  timepieces to bespoke tailoring, every item in our collection represents
                  the absolute pinnacle of its craft.
                </p>
                <p>
                  We believe that true luxury is not about excess, but about perfection in
                  every detail. It's about owning fewer things of exceptional quality, pieces
                  that tell a story and stand the test of time.
                </p>
                <p>
                  Our team travels the globe, building relationships with the world's finest
                  craftsmen and ateliers, ensuring that every product we offer meets our
                  exacting standards of quality, authenticity, and timeless design.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-[4/5] bg-seben-charcoal"
            >
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-seben-charcoal">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="overline text-seben-gold mb-4">Our Values</p>
            <h2 className="text-4xl font-serif text-seben-cream">
              What Sets Us Apart
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-seben-gold/20 rounded-full flex items-center justify-center">
                  <value.icon className="text-seben-gold" size={32} />
                </div>
                <h3 className="text-xl font-serif text-seben-cream mb-4">{value.title}</h3>
                <p className="text-seben-cream/60 text-sm text-luxury">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-seben-cream">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-serif mb-6">
              Experience the SEBEN Difference
            </h2>
            <p className="text-seben-black/70 text-lg mb-8">
              Discover our carefully curated collection and elevate your style to new heights.
            </p>
            <a href="/shop" className="btn-primary inline-block">
              Explore Collections
            </a>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default About