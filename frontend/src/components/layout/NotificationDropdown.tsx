import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsService, InAppNotification } from '../../services/notifications';
import { Bell, CheckCheck, Inbox, Clock } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsService.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      // silently ignore if not logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleItemClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await notificationsService.markAsRead(id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 text-[#202833] hover:text-[#172B46] hover:bg-[#F5F6F8] rounded-2xl transition border border-transparent hover:border-[#E4E7EC] focus:outline-none"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4 text-[#172B46]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F06449] text-white font-display font-bold text-[10px] flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-elevated border border-[#E4E7EC] z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F5F6F8]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-display font-extrabold text-[#172B46]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F06449]/10 text-[#F06449] border border-[#F06449]/20">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#F06449] hover:text-[#D95339] font-bold flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E7EC]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#667085]">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5F6F8] text-[#172B46] flex items-center justify-center mx-auto mb-2 border border-[#E4E7EC]">
                    <Inbox className="w-5 h-5 text-[#172B46]" />
                  </div>
                  <span className="font-medium text-[#667085]">No notifications right now</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n.id, n.isRead)}
                    className={`p-4 hover:bg-[#F5F6F8] transition-colors cursor-pointer text-xs relative ${
                      !n.isRead ? 'bg-[#F5F6F8]/60' : ''
                    }`}
                  >
                    {!n.isRead && (
                      <span className="absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full bg-[#F06449]" />
                    )}
                    <div className="flex items-center justify-between mb-1 pl-1">
                      <span className="font-bold text-[#202833] line-clamp-1">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#667085] shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[#667085] leading-relaxed text-[11px] pl-1">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
