import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  color = 'emerald',
  delay = 0 
}) {
  const colors = {
    emerald: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-500',
      gradient: 'from-emerald-500 to-teal-500'
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500',
      gradient: 'from-blue-500 to-indigo-500'
    },
    purple: {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-500',
      gradient: 'from-purple-500 to-pink-500'
    },
    orange: {
      bg: 'bg-orange-500/10',
      icon: 'text-orange-500',
      gradient: 'from-orange-500 to-amber-500'
    },
    rose: {
      bg: 'bg-rose-500/10',
      icon: 'text-rose-500',
      gradient: 'from-rose-500 to-pink-500'
    }
  };

  const colorSet = colors[color] || colors.emerald;

  return (
    <GlassCard className="p-6" delay={delay}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <motion.p 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
            className="text-3xl font-bold text-slate-900 dark:text-white"
          >
            {value}
          </motion.p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trendUp ? 'text-emerald-500' : 'text-rose-500'
            )}>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
              >
                {trendUp ? '↑' : '↓'} {trend}
              </motion.span>
              <span className="text-slate-400 text-xs">vs last week</span>
            </div>
          )}
        </div>
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          className={cn('p-3 rounded-xl', colorSet.bg)}
        >
          <Icon className={cn('w-6 h-6', colorSet.icon)} />
        </motion.div>
      </div>
      <div className="mt-4 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          transition={{ delay: delay + 0.4, duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', colorSet.gradient)}
        />
      </div>
    </GlassCard>
  );
}