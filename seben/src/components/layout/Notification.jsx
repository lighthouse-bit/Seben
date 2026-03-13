// frontend/src/components/layout/Notification.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, X, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api'; // Make sure this path is correct based on your structure

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const ref = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // We'll create this endpoint shortly
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      // Fallback to empty array or some mock data if endpoint fails
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={16} className="text-white" />;
      case 'success': return <CheckCircle size={16} className="text-white" />;
      case 'order': return <Info size={16} className="text-white" />;
      default: return <Info size={16} className="text-white" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-500';
      case 'success': return 'bg-green-500';
      case 'order': return 'bg-blue-500';
      default: return 'bg-seben-gold';
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-seben-cream hover:text-seben-gold transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-seben-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-seben-black border border-seben-slate rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-seben-slate flex justify-between items-center bg-seben-charcoal">
              <h3 className="font-serif text-seben-cream text-sm tracking-wide">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-seben-gold/20 text-seben-gold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-seben-cream/40 text-sm">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-seben-cream/40 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                    className={`p-4 border-b border-seben-slate cursor-pointer hover:bg-seben-charcoal transition-colors relative ${
                      !notif.read ? 'bg-seben-charcoal/30' : ''
                    }`}
                  >
                    {!notif.read && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-seben-gold rounded-full"></span>
                    )}
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${!notif.read ? 'text-seben-cream' : 'text-seben-cream/70'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-seben-cream/60 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-seben-cream/40 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-seben-slate text-center bg-seben-charcoal">
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-seben-gold hover:text-seben-cream transition-colors uppercase tracking-wider"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;