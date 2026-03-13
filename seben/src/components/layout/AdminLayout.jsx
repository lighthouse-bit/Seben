// frontend/src/components/layout/AdminLayout.jsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Search,
  ChevronDown,
  Plus,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Notification from './Notification' // Import Notification

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-seben-charcoal">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 bottom-0 bg-seben-black z-40 overflow-hidden shadow-xl border-r border-seben-slate"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-seben-slate bg-seben-black">
            <motion.h1
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              className="text-2xl font-serif tracking-[0.3em] text-seben-gold whitespace-nowrap"
            >
              SEBEN
            </motion.h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-seben-cream hover:text-seben-gold transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 mb-2 rounded transition-all group ${
                    isActive
                      ? 'bg-seben-gold text-seben-black'
                      : 'text-seben-cream/70 hover:bg-seben-slate hover:text-seben-cream'
                  }`
                }
              >
                <item.icon size={20} className="shrink-0" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium tracking-wider whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {!isSidebarOpen && (
                  <div className="absolute left-16 bg-seben-gold text-seben-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-seben-slate bg-seben-black">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded hover:bg-seben-slate transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-seben-gold flex items-center justify-center shrink-0">
                <User size={16} className="text-seben-black" />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 text-left overflow-hidden"
                  >
                    <p className="text-seben-cream text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                    <p className="text-seben-cream/60 text-xs truncate">{user?.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {isSidebarOpen && (
                <ChevronDown
                  size={16}
                  className={`text-seben-cream/60 transition-transform ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 py-2 bg-seben-slate rounded overflow-hidden"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-seben-cream/70 hover:text-seben-cream hover:bg-seben-graphite transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 min-h-screen ${
          isSidebarOpen ? 'ml-[280px]' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-seben-charcoal/95 backdrop-blur-md border-b border-seben-slate shadow-sm">
          <div className="h-20 px-8 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-stone" size={20} />
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-seben-black border border-seben-slate text-seben-cream placeholder:text-seben-stone rounded focus:border-seben-gold outline-none transition-colors"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 ml-8">
              {/* Quick Add Button */}
              <button 
                onClick={() => navigate('/admin/products/new')}
                className="btn-gold btn-sm flex items-center gap-2"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Product</span>
              </button>

              {/* Notifications Component - PLACED HERE */}
              <div className="relative">
                <Notification />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout