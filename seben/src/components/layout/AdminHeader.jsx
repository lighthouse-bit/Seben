// src/components/layout/AdminHeader.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Search, 
  Menu,
  ExternalLink,
  Package,
  ShoppingCart,
  X
} from 'lucide-react'

const AdminHeader = ({ onMenuClick, title }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const notifications = [
    { id: 1, type: 'order', message: 'New order #ORD-005 received', time: '5 min ago', unread: true },
    { id: 2, type: 'stock', message: 'Low stock alert: Sovereign Chronograph', time: '1 hour ago', unread: true },
    { id: 3, type: 'order', message: 'Order #ORD-003 has been shipped', time: '2 hours ago', unread: false },
  ]

  return (
    <header className="h-20 bg-white border-b border-seben-black/10 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-seben-cream-dark rounded-lg"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-serif text-seben-black">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-seben-stone" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 bg-seben-cream-dark border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-seben-gold"
          />
        </div>

        {/* View Store */}
        <Link
          to="/"
          target="_blank"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-seben-stone hover:text-seben-black transition-colors"
        >
          <ExternalLink size={16} />
          View Store
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-seben-cream-dark rounded-lg transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-seben-error rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-seben-black/10 shadow-xl z-50"
                >
                  <div className="p-4 border-b border-seben-black/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Notifications</h3>
                      <button className="text-xs text-seben-gold hover:underline">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-seben-black/5 hover:bg-seben-cream-dark cursor-pointer ${
                          notif.unread ? 'bg-seben-gold/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${
                            notif.type === 'order' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            {notif.type === 'order' ? (
                              <ShoppingCart size={16} className="text-blue-600" />
                            ) : (
                              <Package size={16} className="text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-seben-black">{notif.message}</p>
                            <p className="text-xs text-seben-stone mt-1">{notif.time}</p>
                          </div>
                          {notif.unread && (
                            <div className="w-2 h-2 bg-seben-gold rounded-full mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-seben-black/10">
                    <Link
                      to="/admin/notifications"
                      className="text-sm text-seben-gold hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader