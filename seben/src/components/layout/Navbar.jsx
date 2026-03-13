// src/components/Navbar/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Menu, X, User, Package, Heart, MapPin, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useCart } from '../../context/CartContex' // Fixed typo: CartContext
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Notification from '../layout/Notification' // Ensure path is correct

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/shop/suits', label: 'Suits' },
    { path: '/shop/watches', label: 'Watches' },
    { path: '/shop/leather', label: 'Leather' },
  ]

  const userMenuItems = [
    { path: '/account', icon: User, label: 'Profile' },
    { path: '/account/orders', icon: Package, label: 'Orders' },
    { path: '/account/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/account/addresses', icon: MapPin, label: 'Addresses' },
    { path: '/account/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-seben-cream/95 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        {/* Top Bar */}
        <div className="bg-seben-black text-seben-cream py-2 text-center text-xs tracking-widest">
          COMPLIMENTARY SHIPPING ON ORDERS OVER $500
        </div>

        <nav className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
              <h1 className="text-3xl lg:text-4xl font-serif tracking-[0.3em] text-seben-black">
                SEBEN
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm tracking-widest uppercase luxury-underline transition-colors ${
                      isActive ? 'text-seben-gold' : 'text-seben-black hover:text-seben-gold'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:block hover:text-seben-gold transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              
              {/* Notification Icon */}
              {isAuthenticated && <Notification />}
              
              {/* User Account */}
              {isAuthenticated && user ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    className="flex items-center gap-2 hover:text-seben-gold transition-colors"
                  >
                    <User size={20} />
                    <span className="text-sm hidden xl:inline">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                        className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="p-4 bg-seben-cream border-b border-seben-black/10">
                          <p className="font-medium text-seben-black truncate">{user.name}</p>
                          <p className="text-xs text-seben-black/60 truncate">{user.email}</p>
                          {user.role === 'ADMIN' && (
                            <Link
                              to="/admin"
                              className="inline-block mt-2 px-3 py-1 bg-seben-gold/20 text-seben-gold text-xs font-medium rounded hover:bg-seben-gold/30 transition-colors"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-seben-cream transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon size={16} className="text-seben-black/60" />
                              <span className="text-sm text-seben-black">{item.label}</span>
                            </Link>
                          ))}
                          
                          <hr className="my-2 border-seben-black/10" />
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <LogOut size={16} />
                            <span className="text-sm">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="hidden lg:flex items-center gap-2 hover:text-seben-gold transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                  <span className="text-sm hidden xl:inline">Sign In</span>
                </Link>
              )}
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative hover:text-seben-gold transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-seben-gold text-seben-black text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-seben-cream lg:hidden pt-32 overflow-y-auto"
          >
            <nav className="container mx-auto px-6 py-8">
              <div className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `text-2xl font-serif tracking-wider ${
                          isActive ? 'text-seben-gold' : 'text-seben-black'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
                
                {/* Mobile User Section */}
                <div className="pt-6 mt-6 border-t border-seben-black/10">
                  {isAuthenticated && user ? (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-seben-black/60">Logged in as</p>
                        <p className="text-lg font-medium text-seben-black">{user.name}</p>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 text-seben-black"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        
                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 text-seben-gold"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings size={20} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 text-red-600 mt-4"
                        >
                          <LogOut size={20} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-3 text-seben-black"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-seben-black/95 flex items-center justify-center"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-2xl px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Search our collections..."
                className="w-full bg-transparent border-b-2 border-seben-gold text-seben-cream text-2xl py-4 outline-none placeholder:text-seben-cream/50 text-center font-serif"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-8 right-8 text-seben-cream hover:text-seben-gold transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-28" />
    </>
  )
}

export default Navbar