// frontend/src/pages/public/Account/Settings.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Package, Tag, Smartphone } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import userService from '../../../services/userService';

const Settings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Email Notifications
    emailNotifications: true,
    orderUpdates: true,
    orderShipped: true,
    orderDelivered: true,
    promotions: false,
    newsletter: true,
    productRecommendations: false,
    
    // SMS Notifications
    smsNotifications: false,
    smsOrderUpdates: false,
    
    // Privacy
    profileVisibility: 'private',
    showPurchaseHistory: false,
    
    // Communication
    marketingEmails: false,
    surveyInvitations: false,
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const SettingToggle = ({ label, description, checked, onChange, icon: Icon }) => (
    <div className="flex items-start justify-between py-4 border-b border-seben-black/10 last:border-0">
      <div className="flex items-start gap-3 flex-1">
        {Icon && <Icon className="text-seben-gold mt-0.5" size={20} />}
        <div>
          <p className="font-medium text-seben-black">{label}</p>
          {description && (
            <p className="text-sm text-seben-black/60 mt-1">{description}</p>
          )}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-seben-gold"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Mail className="text-seben-gold" size={24} />
          <h2 className="text-xl font-serif text-seben-black">Email Notifications</h2>
        </div>

        <div className="space-y-1">
          <SettingToggle
            icon={Bell}
            label="Email Notifications"
            description="Receive email notifications about your account activity"
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          
          <SettingToggle
            icon={Package}
            label="Order Updates"
            description="Get notified when your order status changes"
            checked={settings.orderUpdates}
            onChange={() => handleToggle('orderUpdates')}
          />
          
          <SettingToggle
            icon={Package}
            label="Order Shipped"
            description="Receive notification when your order ships"
            checked={settings.orderShipped}
            onChange={() => handleToggle('orderShipped')}
          />
          
          <SettingToggle
            icon={Package}
            label="Order Delivered"
            description="Get notified when your order is delivered"
            checked={settings.orderDelivered}
            onChange={() => handleToggle('orderDelivered')}
          />
          
          <SettingToggle
            icon={Mail}
            label="Newsletter"
            description="Receive our monthly newsletter with exclusive content"
            checked={settings.newsletter}
            onChange={() => handleToggle('newsletter')}
          />
        </div>
      </motion.div>

      {/* Marketing Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Tag className="text-seben-gold" size={24} />
          <h2 className="text-xl font-serif text-seben-black">Marketing Preferences</h2>
        </div>

        <div className="space-y-1">
          <SettingToggle
            label="Promotional Emails"
            description="Receive emails about sales, new arrivals, and special offers"
            checked={settings.promotions}
            onChange={() => handleToggle('promotions')}
          />
          
          <SettingToggle
            label="Product Recommendations"
            description="Get personalized product recommendations based on your preferences"
            checked={settings.productRecommendations}
            onChange={() => handleToggle('productRecommendations')}
          />
          
          <SettingToggle
            label="Marketing Communications"
            description="Receive marketing materials from Seben and partners"
            checked={settings.marketingEmails}
            onChange={() => handleToggle('marketingEmails')}
          />
          
          <SettingToggle
            label="Survey Invitations"
            description="Participate in surveys to help us improve"
            checked={settings.surveyInvitations}
            onChange={() => handleToggle('surveyInvitations')}
          />
        </div>
      </motion.div>

      {/* SMS Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="text-seben-gold" size={24} />
          <h2 className="text-xl font-serif text-seben-black">SMS Notifications</h2>
        </div>

        <div className="space-y-1">
          <SettingToggle
            label="SMS Notifications"
            description="Receive text messages about your orders"
            checked={settings.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
          />
          
          <SettingToggle
            label="Order Updates via SMS"
            description="Get order status updates via text message"
            checked={settings.smsOrderUpdates}
            onChange={() => handleToggle('smsOrderUpdates')}
          />
        </div>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="text-seben-gold" size={24} />
          <h2 className="text-xl font-serif text-seben-black">Privacy</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-seben-black/70 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
              className="w-full px-4 py-2 border border-seben-black/20 rounded-lg focus:border-seben-gold outline-none transition-colors"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          <SettingToggle
            label="Show Purchase History"
            description="Allow others to see what you've purchased"
            checked={settings.showPurchaseHistory}
            onChange={() => handleToggle('showPurchaseHistory')}
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Changes to your notification preferences may take up to 24 hours to take effect. 
          You can update your preferences at any time.
        </p>
      </div>
    </div>
  );
};

export default Settings;