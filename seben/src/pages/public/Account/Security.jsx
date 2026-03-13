// frontend/src/pages/public/Account/Security.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import authService from '../../../services/authService';

const Security = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-seben-gold" size={24} />
          <h2 className="text-xl font-serif text-seben-black">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="input pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-seben-black/40 hover:text-seben-black"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="input pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-seben-black/40 hover:text-seben-black"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-seben-black/50 mt-1">
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-seben-gold" size={24} />
          <h2 className="text-xl font-serif text-seben-black">Security Tips</h2>
        </div>

        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-seben-gold mt-1">•</span>
            <div>
              <p className="font-medium text-seben-black">Use a strong password</p>
              <p className="text-sm text-seben-black/60">
                Combine uppercase and lowercase letters, numbers, and symbols
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-seben-gold mt-1">•</span>
            <div>
              <p className="font-medium text-seben-black">Keep your password private</p>
              <p className="text-sm text-seben-black/60">
                Never share your password with anyone
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-seben-gold mt-1">•</span>
            <div>
              <p className="font-medium text-seben-black">Update regularly</p>
              <p className="text-sm text-seben-black/60">
                Change your password every few months for better security
              </p>
            </div>
          </li>
        </ul>
      </motion.div>

      {/* Account Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h2 className="text-xl font-serif text-seben-black mb-4">Recent Activity</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-seben-black/10">
            <div>
              <p className="text-sm font-medium text-seben-black">Last login</p>
              <p className="text-xs text-seben-black/60">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-seben-black">Account created</p>
              <p className="text-xs text-seben-black/60">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Security;