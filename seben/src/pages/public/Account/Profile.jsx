// frontend/src/pages/public/Account/Profile.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import authService from '../../../services/authService';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-seben-black/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-seben-black">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-seben-gold hover:text-seben-gold-dark transition-colors"
            >
              <Edit2 size={18} />
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 text-seben-black/60 hover:text-seben-black transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSubmit}
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                disabled={loading}
              >
                <Save size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-seben-black/10">
            <div className="w-24 h-24 bg-seben-gold rounded-full flex items-center justify-center">
              <span className="text-3xl font-serif text-seben-black">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-seben-black">{user?.name}</h3>
              <p className="text-seben-black/60">Customer since {formatDate(user?.createdAt)}</p>
              {user?.role === 'ADMIN' && (
                <span className="inline-block mt-2 px-3 py-1 bg-seben-gold/20 text-seben-gold text-xs font-medium rounded">
                  Admin Account
                </span>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-seben-black/70 mb-2">
              <User size={16} />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-seben-black/20 rounded-lg focus:border-seben-gold outline-none transition-colors"
                required
              />
            ) : (
              <p className="px-4 py-2 bg-seben-cream rounded-lg">{user?.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-seben-black/70 mb-2">
              <Mail size={16} />
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <p className="flex-1 px-4 py-2 bg-seben-cream rounded-lg">{user?.email}</p>
              {user?.emailVerified && (
                <span className="text-green-600 text-sm">Verified</span>
              )}
            </div>
            <p className="text-xs text-seben-black/50 mt-1">
              Email cannot be changed for security reasons
            </p>
          </div>

          {/* Phone Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-seben-black/70 mb-2">
              <Phone size={16} />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 border border-seben-black/20 rounded-lg focus:border-seben-gold outline-none transition-colors"
              />
            ) : (
              <p className="px-4 py-2 bg-seben-cream rounded-lg">
                {user?.phone || 'Not provided'}
              </p>
            )}
          </div>

          {/* Account Info */}
          <div className="pt-6 border-t border-seben-black/10">
            <h3 className="text-sm font-medium text-seben-black/70 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-seben-black/50 mb-1">Account Created</p>
                <p className="text-sm font-medium">{formatDate(user?.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-seben-black/50 mb-1">Last Login</p>
                <p className="text-sm font-medium">
                  {user?.lastLogin ? formatDate(user.lastLogin) : 'Just now'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button (for mobile) */}
          {isEditing && (
            <div className="flex gap-4 pt-6 lg:hidden">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default Profile;