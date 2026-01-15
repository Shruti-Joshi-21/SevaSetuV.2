import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    attendance: true,
    reports: true,
    leave: true
  });

  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Manage your notification preferences',
      items: [
        { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
        { key: 'attendance', label: 'Attendance Alerts', description: 'Get notified about attendance' },
        { key: 'reports', label: 'Report Updates', description: 'Notifications for report status' },
        { key: 'leave', label: 'Leave Requests', description: 'Leave approval notifications' },
      ]
    },
  ];

  const quickLinks = [
    { icon: Shield, label: 'Privacy & Security', description: 'Manage your account security' },
    { icon: Globe, label: 'Language & Region', description: 'Change language preferences' },
    { icon: Palette, label: 'Appearance', description: 'Theme and display settings' },
    { icon: Database, label: 'Data Management', description: 'Export or delete your data' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help and contact support' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your app preferences and account settings
          </p>
        </div>

        {/* Notifications */}
        {settingsSections.map((section, sIndex) => (
          <GlassCard key={section.title} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <section.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.items.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, [item.key]: checked })
                    }
                  />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        ))}

        {/* Quick Links */}
        <GlassCard className="p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
            Quick Settings
          </h2>
          <div className="space-y-2">
            {quickLinks.map((link, index) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <link.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {link.label}
                    </p>
                    <p className="text-sm text-slate-500">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* App Info */}
        <GlassCard className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">EcoOps</h3>
            <p className="text-sm text-slate-500 mb-4">Field Operations Management</p>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}