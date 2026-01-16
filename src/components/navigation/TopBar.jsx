import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  X,
  Check,
  Trash2
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function TopBar({ onMenuToggle, user, pageTitle }) {
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {pageTitle || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {searchOpen ? (
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.div>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80"
                >
                  <GlassCard className="p-2 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              !notification.is_read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <button
                                    onClick={() => markReadMutation.mutate(notification.id)}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                  >
                                    <Check className="w-4 h-4 text-emerald-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                >
                                  <Trash2 className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}