// src/components/Footer/Footer.jsx
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Youtube, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'All Collections', path: '/shop' },
      { label: 'Clothing', path: '/shop/clothing' },
      { label: 'Accessories', path: '/shop/accessories' },
      { label: 'Jewelry', path: '/shop/jewelry' },
      { label: 'Watches', path: '/shop/watches' },
    ],
    customer: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'Shipping & Returns', path: '/shipping' },
      { label: 'Size Guide', path: '/size-guide' },
      { label: 'FAQs', path: '/faqs' },
      { label: 'Track Order', path: '/track-order' },
    ],
    company: [
      { label: 'About Seben', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
      { label: 'Sustainability', path: '/sustainability' },
    ],
  }

  const socialLinks = [
    { icon: Instagram, url: '#', label: 'Instagram' },
    { icon: Facebook, url: '#', label: 'Facebook' },
    { icon: Twitter, url: '#', label: 'Twitter' },
    { icon: Youtube, url: '#', label: 'Youtube' },
  ]

  return (
    <footer className="bg-seben-black text-seben-cream">
      {/* Newsletter Section */}
      <div className="border-b border-seben-cream/10">
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-serif mb-4">Join the Seben World</h3>
            <p className="text-seben-cream/60 mb-6 text-sm">
              Subscribe to receive exclusive offers, early access to new collections, 
              and curated content.
            </p>
            <form className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-cream/40" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent border border-seben-cream/20 py-4 pl-12 pr-4 text-seben-cream placeholder:text-seben-cream/40 focus:border-seben-gold outline-none transition-colors"
                />
              </div>
              <button type="submit" className="btn-gold">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <h2 className="text-3xl font-serif tracking-[0.3em]">SEBEN</h2>
            </Link>
            <p className="text-seben-cream/60 text-sm leading-relaxed mb-8 max-w-sm">
              Established with a vision to redefine luxury, Seben curates the finest 
              pieces from around the world, bringing timeless elegance to the discerning individual.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  aria-label={social.label}
                  className="w-10 h-10 border border-seben-cream/20 flex items-center justify-center hover:border-seben-gold hover:text-seben-gold transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6">Shop</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-seben-cream/60 hover:text-seben-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6">Customer Service</h4>
            <ul className="space-y-4">
              {footerLinks.customer.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-seben-cream/60 hover:text-seben-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-seben-cream/60 hover:text-seben-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-seben-cream/10">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-seben-cream/40 text-sm">
              © {currentYear} Seben. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-seben-cream/40 hover:text-seben-cream text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-seben-cream/40 hover:text-seben-cream text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer