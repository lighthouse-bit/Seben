// src/components/Hero/Hero.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: "Timeless Elegance",
    subtitle: "New Collection 2024",
    description: "Discover our curated selection of luxury pieces, crafted for those who appreciate the finer things in life.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920",
    cta: "Explore Collection",
    link: "/shop",
  },
  {
    id: 2,
    title: "Artisan Jewelry",
    subtitle: "Handcrafted Excellence",
    description: "Each piece tells a story of heritage and craftsmanship, designed to be treasured for generations.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920",
    cta: "View Jewelry",
    link: "/shop/jewelry",
  },
  {
    id: 3,
    title: "Luxury Timepieces",
    subtitle: "Precision & Beauty",
    description: "Exquisite watches that embody the perfect harmony of engineering excellence and aesthetic beauty.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920",
    cta: "Shop Watches",
    link: "/shop/watches",
  },
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-seben-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-seben-black/80 via-seben-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-6 lg:px-12 flex items-center">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-seben-gold text-sm tracking-[0.3em] uppercase mb-4"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl lg:text-7xl font-serif text-seben-cream mb-6 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-seben-cream/80 text-lg mb-8 text-luxury max-w-lg"
              >
                {slides[currentSlide].description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to={slides[currentSlide].link} className="btn-gold inline-block">
                  {slides[currentSlide].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-6 right-6 flex justify-between pointer-events-none">
        <button
          onClick={prevSlide}
          className="p-3 bg-seben-cream/10 backdrop-blur-sm text-seben-cream hover:bg-seben-gold hover:text-seben-black transition-all pointer-events-auto"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 bg-seben-cream/10 backdrop-blur-sm text-seben-cream hover:bg-seben-gold hover:text-seben-black transition-all pointer-events-auto"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-[2px] transition-all duration-500 ${
              index === currentSlide 
                ? 'w-12 bg-seben-gold' 
                : 'w-6 bg-seben-cream/40 hover:bg-seben-cream/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero