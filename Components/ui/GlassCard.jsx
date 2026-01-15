import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassCard({ 
  children, 
  className, 
  hover = true,
  onClick,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        transition: { duration: 0.2 }
      } : {}}
      onClick={onClick}
      className={cn(
        'backdrop-blur-xl bg-white/70 dark:bg-slate-900/70',
        'border border-white/20 dark:border-slate-700/50',
        'rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
        'transition-colors duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}