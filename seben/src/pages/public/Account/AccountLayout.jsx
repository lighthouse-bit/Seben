// frontend/src/pages/public/Account/AccountLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const AccountLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { path: '/account', icon: User, label: 'Profile', end: true },
    { path: '/account/orders', icon: Package, label: 'Orders' },
    { path: '/account/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/account/addresses', icon: MapPin, label: 'Addresses' },
    { path: '/account/security', icon: Lock, label: 'Security' },
    { path: '/account/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-seben-cream py-12">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-seben-black">My Account</h1>
          <p className="text-seben-black/60 mt-2">Welcome back, {user?.name}</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {/* User Info */}
              <div className="mb-8 pb-6 border-b border-seben-black/10">
                <div className="w-20 h-20 bg-seben-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-serif text-seben-black">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-center font-medium text-seben-black">{user?.name}</h3>
                <p className="text-center text-sm text-seben-black/60">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-seben-gold/10 text-seben-gold'
                          : 'text-seben-black/70 hover:bg-seben-cream hover:text-seben-black'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                    <ChevronRight size={16} className="ml-auto" />
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-seben-black/70 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-seben-black text-seben-cream rounded-full flex items-center justify-center shadow-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="lg:hidden fixed inset-0 z-30 bg-white"
            >
              <div className="p-6">
                <h2 className="text-xl font-serif mb-6">Menu</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg ${
                          isActive
                            ? 'bg-seben-gold/10 text-seben-gold'
                            : 'text-seben-black/70'
                        }`
                      }
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;