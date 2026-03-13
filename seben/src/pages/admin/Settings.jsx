// src/pages/admin/Settings.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, User, Bell, Shield, Palette } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const AdminSettings = () => {
  const toast = useToast()
  const [settings, setSettings] = useState({
    siteName: 'SEBEN',
    email: 'admin@seben.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD',
    taxRate: '8.9',
    shippingThreshold: '500',
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-seben-cream">Settings</h1>
        <p className="text-seben-cream/60 mt-1">Manage your store settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-seben-gold" size={24} />
            <h2 className="text-lg font-medium text-seben-cream">General</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label-dark">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-dark">Contact Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-dark">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-dark">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="input-dark"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-seben-gold" size={24} />
            <h2 className="text-lg font-medium text-seben-cream">Store Settings</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label-dark">Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="input-dark"
                step="0.1"
              />
            </div>
            <div>
              <label className="label-dark">Free Shipping Threshold ($)</label>
              <input
                type="number"
                name="shippingThreshold"
                value={settings.shippingThreshold}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-seben-gold" size={24} />
            <h2 className="text-lg font-medium text-seben-cream">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-seben-cream">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="accent-seben-gold"
              />
              Email Notifications
            </label>
            <label className="flex items-center gap-3 text-seben-cream">
              <input
                type="checkbox"
                name="orderNotifications"
                checked={settings.orderNotifications}
                onChange={handleChange}
                className="accent-seben-gold"
              />
              New Order Notifications
            </label>
            <label className="flex items-center gap-3 text-seben-cream">
              <input
                type="checkbox"
                name="lowStockAlerts"
                checked={settings.lowStockAlerts}
                onChange={handleChange}
                className="accent-seben-gold"
              />
              Low Stock Alerts
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-gold flex items-center gap-2">
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings