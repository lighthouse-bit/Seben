// src/pages/admin/OrderDetail.jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  Send,
  Edit,
  Printer,
  Phone,
  Mail,
  MessageSquare,
  XCircle,
} from 'lucide-react'
import { orders, orderStatuses } from '../../data/orders'
import { useToast } from '../../context/ToastContext'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [order, setOrder] = useState(orders.find(o => o.id === id))
  const [notes, setNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-seben-cream text-xl mb-4">Order not found</p>
        <button onClick={() => navigate('/admin/orders')} className="btn-outline-light">
          Back to Orders
        </button>
      </div>
    )
  }

  const updateStatus = (newStatus) => {
    setOrder(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }))
    toast.success(`Order status updated to ${newStatus}`)
  }

  const sendTrackingInfo = () => {
    if (!trackingNumber) {
      toast.error('Please enter a tracking number')
      return
    }
    toast.success('Tracking information sent to customer')
    setTrackingNumber('')
  }

  const addNote = () => {
    if (!notes.trim()) {
      toast.error('Please enter a note')
      return
    }
    toast.success('Note added to order')
    setNotes('')
    setShowNotesModal(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />
      case 'processing':
        return <Package size={16} />
      case 'shipped':
        return <Truck size={16} />
      case 'delivered':
        return <CheckCircle size={16} />
      case 'cancelled':
        return <XCircle size={16} />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const timeline = [
    { status: 'pending', label: 'Order Placed', time: order.createdAt, completed: true },
    { status: 'processing', label: 'Processing', time: null, completed: false },
    { status: 'shipped', label: 'Shipped', time: null, completed: false },
    { status: 'delivered', label: 'Delivered', time: null, completed: false },
  ]

  const currentStatusIndex = timeline.findIndex(t => t.status === order.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 text-seben-cream/60 hover:text-seben-cream transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-seben-cream">Order {order.id}</h1>
            <p className="text-seben-cream/60 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="btn-outline-light btn-sm flex items-center gap-2">
            <Printer size={16} />
            Print Invoice
          </button>
          <button className="btn-outline-light btn-sm flex items-center gap-2">
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-seben-cream">Order Status</h2>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="px-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream rounded focus:border-seben-gold outline-none"
              >
                {orderStatuses.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Status Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-seben-slate" />
              {timeline.map((item, index) => {
                const isCompleted = index <= currentStatusIndex
                const isCurrent = item.status === order.status
                
                return (
                  <div key={item.status} className="relative flex items-start gap-6 pb-8 last:pb-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        isCompleted
                          ? 'bg-seben-gold text-seben-black'
                          : 'bg-seben-charcoal border-2 border-seben-slate text-seben-cream/40'
                      }`}
                    >
                      {isCompleted ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isCompleted ? 'text-seben-cream' : 'text-seben-cream/40'}`}>
                        {item.label}
                      </p>
                      {item.time && (
                        <p className="text-seben-cream/60 text-sm mt-1">
                          {new Date(item.time).toLocaleString()}
                        </p>
                      )}
                      {isCurrent && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mt-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          Current Status
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tracking Information */}
            {order.status === 'shipped' && (
              <div className="mt-6 pt-6 border-t border-seben-slate">
                <label className="block text-sm text-seben-cream/60 mb-2">Tracking Number</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="flex-1 px-4 py-2 bg-seben-charcoal border border-seben-slate text-seben-cream rounded focus:border-seben-gold outline-none"
                  />
                  <button
                    onClick={sendTrackingInfo}
                    className="btn-gold btn-sm flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send to Customer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <h2 className="text-lg font-medium text-seben-cream mb-6">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-seben-slate last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-seben-charcoal rounded flex items-center justify-center">
                    <Package className="text-seben-stone" size={32} />
                  </div>
                  <div className="flex-1">
                    <p className="text-seben-cream font-medium">{item.name}</p>
                    <p className="text-seben-cream/60 text-sm">
                      {item.size && `Size: ${item.size} • `}
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-seben-cream">${item.price.toLocaleString()}</p>
                    <p className="text-seben-cream/60 text-sm">
                      Total: ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-seben-slate space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-seben-cream/60">Subtotal</span>
                <span className="text-seben-cream">${order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-seben-cream/60">Shipping</span>
                <span className="text-seben-cream">
                  {order.shipping === 0 ? 'Free' : `$${order.shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-seben-cream/60">Tax</span>
                <span className="text-seben-cream">${order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-3 border-t border-seben-slate">
                <span className="text-seben-cream">Total</span>
                <span className="text-seben-gold">${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-seben-cream">Shipping Address</h2>
              <button className="text-seben-gold hover:text-seben-gold-light transition-colors">
                <Edit size={16} />
              </button>
            </div>
            
            <div className="flex items-start gap-4">
              <MapPin className="text-seben-cream/60 mt-1" size={20} />
              <div className="text-seben-cream/80">
                <p>{order.customer.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <h2 className="text-lg font-medium text-seben-cream mb-6">Customer Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-seben-cream/60 mt-0.5" size={18} />
                <div>
                  <p className="text-seben-cream font-medium">{order.customer.name}</p>
                  <p className="text-seben-cream/60 text-sm">Customer ID: #{order.customer.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="text-seben-cream/60" size={18} />
                <a href={`mailto:${order.customer.email}`} className="text-seben-cream hover:text-seben-gold transition-colors text-sm">
                  {order.customer.email}
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-seben-cream/60" size={18} />
                <a href={`tel:${order.customer.phone}`} className="text-seben-cream hover:text-seben-gold transition-colors text-sm">
                  {order.customer.phone}
                </a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-seben-slate">
              <button className="w-full btn-outline-light btn-sm flex items-center justify-center gap-2">
                <MessageSquare size={16} />
                Contact Customer
              </button>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <h2 className="text-lg font-medium text-seben-cream mb-6">Payment Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="text-seben-cream/60" size={18} />
                <div>
                  <p className="text-seben-cream">{order.paymentMethod}</p>
                  <p className="text-seben-cream/60 text-sm">•••• •••• •••• 4242</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-seben-cream/60">Status</span>
                <span className="text-green-400">Paid</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-seben-cream/60">Amount</span>
                <span className="text-seben-cream">${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-seben-cream">Order Notes</h2>
              <button
                onClick={() => setShowNotesModal(true)}
                className="text-seben-gold hover:text-seben-gold-light transition-colors"
              >
                <Edit size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-seben-charcoal rounded">
                <p className="text-seben-cream/60 text-xs mb-1">Admin • 2 hours ago</p>
                <p className="text-seben-cream text-sm">Order confirmed and processing started.</p>
              </div>
              <div className="p-3 bg-seben-charcoal rounded">
                <p className="text-seben-cream/60 text-xs mb-1">System • 1 day ago</p>
                <p className="text-seben-cream text-sm">Payment received successfully.</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-seben-black border border-seben-slate rounded-lg p-6">
            <h2 className="text-lg font-medium text-seben-cream mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full btn-outline-light btn-sm">
                Send Invoice
              </button>
              <button className="w-full btn-outline-light btn-sm">
                Issue Refund
              </button>
              <button className="w-full btn-outline-light btn-sm text-red-400 hover:bg-red-400/20">
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setShowNotesModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-seben-charcoal border border-seben-slate rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-seben-cream mb-4">Add Note</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-seben-black border border-seben-slate text-seben-cream rounded focus:border-seben-gold outline-none mb-4"
              placeholder="Enter your note here..."
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 btn-outline-light"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                className="flex-1 btn-gold"
              >
                Add Note
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default OrderDetail