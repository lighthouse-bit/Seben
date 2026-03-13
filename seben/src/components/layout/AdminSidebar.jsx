// src/components/layout/AdminSidebar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Tag,
  BarChart3,
  Bell,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const AdminSidebar = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { 
      path: '/admin', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      exact: true 
    },
    { 
      path: '/admin/products', 
      icon: Package, 
      label: 'Products' 
    },
    { 
      path: '/admin/orders', 
      icon: ShoppingCart, 
      label: 'Orders',
      badge: 3 
    },
    { 
      path: '/admin/customers', 
      icon: Users, 
      label: 'Customers' 
    },
    { 
      path: '/admin/analytics', 
      icon: BarChart3, 
      label: 'Analytics' 
    },
    { 
      path: '/admin/settings', 
      icon: Settings, 
      label: 'Settings' 
    },
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-seben-black text-seben-cream z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-seben-charcoal">
        <motion.div
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          className="overflow-hidden"
        >
          <h1 className="text-2xl font-serif tracking-[0.2em]">SEBEN</h1>
        </motion.div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-seben-charcoal rounded-lg transition-colors"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft size={20} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-seben-gold text-seben-black'
                      : 'text-seben-cream/70 hover:bg-seben-charcoal hover:text-seben-cream'
                  }`}
                >
                  <item.icon size={20} />
                  <motion.span
                    initial={false}
                    animate={{ 
                      opacity: isCollapsed ? 0 : 1,
                      display: isCollapsed ? 'none' : 'block' 
                    }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-seben-error text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-seben-charcoal">
        <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-seben-gold flex items-center justify-center text-seben-black font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-seben-cream/50 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-4 py-2 text-seben-cream/70 hover:text-seben-cream hover:bg-seben-charcoal rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export default AdminSidebar