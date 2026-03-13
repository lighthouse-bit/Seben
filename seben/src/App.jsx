// frontend/src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'

// Layouts
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/layout/AdminLayout'

// Public Pages
import Home from './pages/public/Home'
import Shop from './pages/public/ShopPage'  
import ProductDetail from './pages/public/ProductDetail'
import CartPage from './pages/public/Cart'
import Checkout from './pages/public/Checkout'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import About from './pages/public/About'

// Account Pages
import AccountLayout from './pages/public/Account/AccountLayout'
import Profile from './pages/public/Account/Profile'
import Orders from './pages/public/Account/Orders'
import OrderDetail from './pages/public/Account/OrderDetail'
import Addresses from './pages/public/Account/Addresses'
import Wishlist from './pages/public/Account/Wishlist'
import Security from './pages/public/Account/Security'
import Settings from './pages/public/Account/Settings'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminCustomers from './pages/admin/Customers'
import AdminSettings from './pages/admin/Settings'

// Loading Spinner
import LoadingSpinner from './components/common/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public Layout Wrapper
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-seben-cream">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

// Auth Layout (No Navbar/Footer)
const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-seben-cream">
    {children}
  </div>
)

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/shop/:category" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        
        {/* Auth Routes (No Navbar/Footer) */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Protected Account Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <AccountLayout />
              </PublicLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App