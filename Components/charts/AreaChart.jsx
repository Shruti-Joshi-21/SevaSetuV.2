import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import GlassCard from '../ui/GlassCard';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AreaChartComponent({ 
  data, 
  title, 
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#10b981',
  height = 300,
  delay = 0
}) {
  return (
    <GlassCard className="p-6" delay={delay}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        <ResponsiveContainer width="100%" height={height}>
          <RechartsAreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </motion.div>
    </GlassCard>
  );
}