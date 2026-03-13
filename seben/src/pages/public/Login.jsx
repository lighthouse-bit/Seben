// frontend/src/pages/public/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, adminLogin, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Get redirect path from location state or default to home/admin
  const from = location.state?.from?.pathname || (isAdminLogin ? '/admin' : '/');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (isAdminLogin) {
        result = await adminLogin(formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        toast.success('Login successful! Welcome back.');
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Invalid credentials');
        setErrors({ password: result.error || 'Invalid email or password' });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setErrors({ password: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex"
    >
      {/* Left Side - Image */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seben-black/70 to-seben-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <h1 className="text-5xl font-serif text-seben-cream mb-4 tracking-[0.3em]">
            SEBEN
          </h1>
          <p className="text-seben-cream/80 text-lg text-center max-w-md">
            Discover luxury redefined. Premium menswear crafted for the modern gentleman.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-seben-cream">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-serif tracking-[0.3em] text-seben-black">SEBEN</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif mb-2">Welcome Back</h2>
            <p className="text-seben-black/60">
              {isAdminLogin 
                ? 'Sign in to access the admin dashboard' 
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex mb-6 p-1 bg-seben-cream-dark rounded-lg">
            <button
              type="button"
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                !isAdminLogin 
                  ? 'bg-white text-seben-black shadow-sm' 
                  : 'text-seben-black/60 hover:text-seben-black'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                isAdminLogin 
                  ? 'bg-white text-seben-black shadow-sm' 
                  : 'text-seben-black/60 hover:text-seben-black'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Demo Credentials */}
          {isAdminLogin && (
            <div className="mb-6 p-4 bg-seben-gold/10 border border-seben-gold/30 rounded-lg">
              <p className="text-sm text-seben-black/70 mb-2">
                <strong>Demo Admin Credentials:</strong>
              </p>
              <p className="text-sm text-seben-black/70">
                Email: <code className="bg-seben-black/10 px-2 py-1 rounded">admin@seben.com</code>
              </p>
              <p className="text-sm text-seben-black/70">
                Password: <code className="bg-seben-black/10 px-2 py-1 rounded">Admin@123</code>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-black/40" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-black/40" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-seben-black/40 hover:text-seben-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 accent-seben-gold rounded" 
                />
                <span className="text-sm text-seben-black/70">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-seben-gold hover:text-seben-gold-dark transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {!isAdminLogin && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-seben-black/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-seben-cream text-seben-black/60">
                    New to Seben?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                to="/register"
                className="w-full btn-outline flex items-center justify-center gap-2"
              >
                Create an Account
                <ArrowRight size={20} />
              </Link>
            </>
          )}

          {/* Back to Store */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-sm text-seben-black/60 hover:text-seben-gold transition-colors"
            >
              ← Back to Store
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;