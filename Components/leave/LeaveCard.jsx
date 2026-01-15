import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import AnimatedButton from '../ui/AnimatedButton';

const leaveTypeColors = {
  sick: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  personal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  vacation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  emergency: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
};

export default function LeaveCard({ 
  leave, 
  showActions = false, 
  onApprove, 
  onReject,
  delay = 0 
}) {
  const startDate = leave.start_date ? parseISO(leave.start_date) : null;
  const endDate = leave.end_date ? parseISO(leave.end_date) : null;

  return (
    <GlassCard className="p-5" delay={delay}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-white font-semibold">
              {leave.user_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {leave.user_name}
            </h4>
            <p className="text-sm text-slate-500">{leave.user_email}</p>
          </div>
        </div>
        <StatusBadge status={leave.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${leaveTypeColors[leave.leave_type]}`}>
            {leave.leave_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className="text-sm text-slate-500">
            {leave.days_count} day{leave.days_count !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>
            {startDate && format(startDate, 'MMM d, yyyy')}
            {' → '}
            {endDate && format(endDate, 'MMM d, yyyy')}
          </span>
        </div>

        {leave.reason && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {leave.reason}
            </p>
          </div>
        )}

        {leave.review_comments && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Review Comment
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                {leave.review_comments}
              </p>
            </div>
          </div>
        )}
      </div>

      {showActions && leave.status === 'pending' && (
        <div className="flex items-center gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <AnimatedButton
            variant="success"
            size="sm"
            className="flex-1"
            onClick={() => onApprove?.(leave)}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </AnimatedButton>
          <AnimatedButton
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => onReject?.(leave)}
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </AnimatedButton>
        </div>
      )}

      {leave.reviewed_by && (
        <div className="pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs text-slate-500">
            Reviewed by {leave.reviewed_by} on {leave.review_date && format(parseISO(leave.review_date), 'MMM d, yyyy')}
          </p>
        </div>
      )}
    </GlassCard>
  );
}