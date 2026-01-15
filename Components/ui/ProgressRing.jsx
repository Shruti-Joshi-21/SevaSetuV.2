import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8,
  color = 'emerald',
  showPercentage = true,
  children
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colors = {
    emerald: { stroke: '#10b981', bg: '#10b98120' },
    blue: { stroke: '#3b82f6', bg: '#3b82f620' },
    purple: { stroke: '#8b5cf6', bg: '#8b5cf620' },
    orange: { stroke: '#f97316', bg: '#f9731620' },
    rose: { stroke: '#f43f5e', bg: '#f43f5e20' }
  };

  const colorSet = colors[color] || colors.emerald;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorSet.bg}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorSet.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            {Math.round(progress)}%
          </motion.span>
        ))}
      </div>
    </div>
  );
}