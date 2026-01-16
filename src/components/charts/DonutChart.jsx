import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import GlassCard from '../ui/GlassCard';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium" style={{ color: payload[0].payload.fill }}>
          {payload[0].name}
        </p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function DonutChart({ 
  data, 
  title, 
  centerLabel,
  centerValue,
  height = 250,
  delay = 0
}) {
  return (
    <GlassCard className="p-6" delay={delay}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.4 }}
                className="text-3xl font-bold text-slate-900 dark:text-white"
              >
                {centerValue}
              </motion.p>
              <p className="text-sm text-slate-500">{centerLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}