// frontend/src/pages/public/Home.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import Categories from '../../components/Categories/Categories';
import LuxuryBanner from '../../components/UI/LuxuryBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import productService from '../../services/productService';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [featured, newProducts] = await Promise.all([
        productService.getFeaturedProducts(4),
        productService.getNewArrivals(4),
      ]);
      
      setFeaturedProducts(featured);
      setNewArrivals(newProducts);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Services Section
  const Services = () => {
    const services = [
      {
        title: 'Complimentary Shipping',
        description: 'Free express shipping on all orders over $500',
        icon: '✦',
      },
      {
        title: 'Authenticity Guaranteed',
        description: 'Every piece comes with a certificate of authenticity',
        icon: '◆',
      },
      {
        title: 'Luxury Packaging',
        description: 'Exquisite presentation boxes with every purchase',
        icon: '❖',
      },
      {
        title: 'Personal Styling',
        description: 'Complimentary styling consultations available',
        icon: '✧',
      },
    ];

    return (
      <section className="py-16 bg-seben-black">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <span className="text-seben-gold text-2xl mb-4 block">{service.icon}</span>
                <h3 className="text-seben-cream font-serif text-lg mb-2">{service.title}</h3>
                <p className="text-seben-cream/50 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Featured Products Section
  const FeaturedSection = () => (
    <section className="py-24 bg-seben-cream">
      <div className="container mx-auto px-6 lg:px-12">
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

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

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
          </>
        )}
      </div>
    </section>
  );

  // New Arrivals Section
  const NewArrivalsSection = () => (
    <section className="py-24 bg-seben-cream-dark">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-seben-gold text-sm tracking-[0.3em] uppercase mb-4">
            Just In
          </p>
          <h2 className="text-4xl lg:text-5xl font-serif text-seben-black mb-6">
            New Arrivals
          </h2>
          <div className="w-24 h-[1px] bg-seben-gold mx-auto" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <Services />
      <FeaturedSection />
      <LuxuryBanner />
      <NewArrivalsSection />
      <Categories />
    </motion.div>
  );
};

export default Home;