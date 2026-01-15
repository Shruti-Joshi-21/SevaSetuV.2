import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle } from 'lucide-react';

export default function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  success,
  icon: Icon,
  className,
  required,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isActive = focused || hasValue;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Icon className={cn(
              'w-5 h-5 transition-colors duration-200',
              isActive ? 'text-emerald-500' : 'text-slate-400'
            )} />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full px-4 py-4 pt-6 rounded-xl',
            'bg-white/50 dark:bg-slate-800/50',
            'border-2 transition-all duration-200',
            'focus:outline-none',
            'text-slate-900 dark:text-white',
            'placeholder-transparent',
            Icon && 'pl-12',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : success
                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
          )}
          placeholder={label}
          {...props}
        />
        
        <motion.label
          initial={false}
          animate={{
            y: isActive ? 0 : 8,
            scale: isActive ? 0.75 : 1,
            x: isActive ? (Icon ? -8 : 0) : 0
          }}
          className={cn(
            'absolute left-4 top-2 origin-left pointer-events-none',
            'text-slate-500 dark:text-slate-400 transition-colors duration-200',
            Icon && 'left-12',
            isActive && 'text-emerald-600 dark:text-emerald-400',
            error && 'text-red-500',
            success && 'text-emerald-500'
          )}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </motion.label>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
            )}
            {success && !error && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Check className="w-5 h-5 text-emerald-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="text-sm text-red-500 mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}