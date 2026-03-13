// frontend/src/pages/public/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader, 
  User, 
  Phone,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account');
    }
  }, [isAuthenticated, navigate]);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
      });

      if (result.success) {
        toast.success('Account created successfully! Welcome to Seben.');
        navigate('/account');
      } else {
        toast.error(result.error || 'Registration failed');
        if (result.error?.includes('email')) {
          setErrors({ email: result.error });
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-seben-black/40'}`}>
      {met ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );

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
          backgroundImage: 'url(https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seben-black/70 to-seben-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <h1 className="text-5xl font-serif text-seben-cream mb-4 tracking-[0.3em]">
            SEBEN
          </h1>
          <p className="text-seben-cream/80 text-lg text-center max-w-md mb-8">
            Join the world of luxury menswear. Create your account today.
          </p>
          
          {/* Benefits */}
          <div className="space-y-4 text-seben-cream/80">
            <div className="flex items-center gap-3">
              <Check className="text-seben-gold" size={20} />
              <span>Exclusive member-only offers</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-seben-gold" size={20} />
              <span>Early access to new collections</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-seben-gold" size={20} />
              <span>Personalized recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-seben-gold" size={20} />
              <span>Order tracking & history</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-seben-cream overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-serif tracking-[0.3em] text-seben-black">SEBEN</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif mb-2">Create Account</h2>
            <p className="text-seben-black/60">
              Join Seben and discover luxury menswear
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-black/40" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input pl-12 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address *</label>
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

            {/* Phone (Optional) */}
            <div>
              <label className="label">Phone Number <span className="text-seben-black/40">(Optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-black/40" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input pl-12 ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-black/40" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Create a password"
                  autoComplete="new-password"
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
              
              {/* Password Strength Indicators */}
              {formData.password && (
                <div className="mt-3 p-3 bg-seben-cream-dark rounded-lg">
                  <p className="text-xs text-seben-black/60 mb-2">Password strength:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <PasswordRequirement met={passwordStrength.length} text="8+ characters" />
                    <PasswordRequirement met={passwordStrength.uppercase} text="Uppercase letter" />
                    <PasswordRequirement met={passwordStrength.lowercase} text="Lowercase letter" />
                    <PasswordRequirement met={passwordStrength.number} text="Number" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-seben-black/40" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-12 pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-seben-black/40 hover:text-seben-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <Check size={14} /> Passwords match
                </p>
              )}
            </div>

            {/* Terms & Newsletter */}
            <div className="space-y-3">
              <label className={`flex items-start gap-3 cursor-pointer ${errors.agreeToTerms ? 'text-red-500' : ''}`}>
                <input 
                  type="checkbox" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 accent-seben-gold rounded mt-0.5" 
                />
                <span className="text-sm text-seben-black/70">
                  I agree to the{' '}
                  <Link to="/terms" className="text-seben-gold hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-seben-gold hover:underline">Privacy Policy</Link>
                  {' '}*
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm ml-7">{errors.agreeToTerms}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleChange}
                  className="w-4 h-4 accent-seben-gold rounded mt-0.5" 
                />
                <span className="text-sm text-seben-black/70">
                  Subscribe to our newsletter for exclusive offers and updates
                </span>
              </label>
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-seben-black/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-seben-cream text-seben-black/60">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="w-full btn-outline flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight size={20} />
          </Link>

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

export default Register;