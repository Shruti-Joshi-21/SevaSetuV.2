import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import ProgressRing from '../ui/ProgressRing';

export default function TaskCard({ task, delay = 0, showProgress = true, onClick }) {
  const startDate = task.start_date ? parseISO(task.start_date) : null;
  const endDate = task.end_date ? parseISO(task.end_date) : null;
  const isOverdue = endDate && isPast(endDate) && task.status !== 'completed';

  const getDateDisplay = () => {
    if (!startDate) return 'No date set';
    if (isToday(startDate)) return 'Today';
    if (isTomorrow(startDate)) return 'Tomorrow';
    return format(startDate, 'MMM d, yyyy');
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <GlassCard 
      className="p-5 group cursor-pointer" 
      delay={delay}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={task.status} size="sm" />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
            {task.title}
          </h3>
          {task.project_name && (
            <p className="text-sm text-slate-500 truncate">{task.project_name}</p>
          )}
        </div>
        
        {showProgress && (
          <div className="ml-4 flex-shrink-0">
            <ProgressRing 
              progress={task.completion_percentage || 0} 
              size={60} 
              strokeWidth={5}
              color={isOverdue ? 'rose' : 'emerald'}
            />
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {task.location_name && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{task.location_name}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
            {getDateDisplay()}
            {isOverdue && <AlertTriangle className="w-3 h-3 inline ml-1" />}
          </span>
        </div>
        
        {task.start_time && task.end_time && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{task.start_time} - {task.end_time}</span>
          </div>
        )}

        {task.assigned_volunteers?.length > 0 && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Users className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{task.assigned_volunteers.length} volunteer{task.assigned_volunteers.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.total_hours_logged > 0 && (
            <span className="text-sm text-slate-500">
              {task.total_hours_logged}h logged
            </span>
          )}
        </div>
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          className="text-emerald-500"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </div>
    </GlassCard>
  );
}