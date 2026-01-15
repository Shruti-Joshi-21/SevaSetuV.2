import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { differenceInDays, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  Send
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';
import FloatingInput from '../ui/FloatingInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const leaveTypes = [
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-700' },
  { value: 'personal', label: 'Personal Leave', color: 'bg-blue-100 text-blue-700' },
  { value: 'vacation', label: 'Vacation', color: 'bg-purple-100 text-purple-700' },
  { value: 'emergency', label: 'Emergency', color: 'bg-orange-100 text-orange-700' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-700' },
];

export default function LeaveForm({ user, userProfile, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    leave_type: 'personal',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const daysCount = formData.start_date && formData.end_date
    ? differenceInDays(parseISO(formData.end_date), parseISO(formData.start_date)) + 1
    : 0;

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date || !formData.reason) return;

    setLoading(true);
    try {
      await base44.entities.LeaveRequest.create({
        user_email: user.email,
        user_name: user.full_name,
        user_role: userProfile?.user_role || 'volunteer',
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        status: 'pending',
        days_count: daysCount
      });

      // Create notification for admin
      await base44.entities.Notification.create({
        user_email: 'admin@example.com', // In real app, fetch admin emails
        title: 'New Leave Request',
        message: `${user.full_name} has requested ${daysCount} day(s) of ${formData.leave_type} leave`,
        type: 'leave'
      });

      onSuccess?.();
    } catch (error) {
      console.error('Leave request error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Request Leave
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Submit your leave request for approval
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Leave Type
          </label>
          <Select 
            value={formData.leave_type} 
            onValueChange={(v) => setFormData({ ...formData, leave_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.color}`}>
                      {type.label}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Start Date
            </label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              End Date
            </label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              min={formData.start_date || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {daysCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
          >
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              Total: <strong>{daysCount}</strong> day{daysCount !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Reason
          </label>
          <Textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Please provide a reason for your leave request..."
            className="min-h-24"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {onCancel && (
          <AnimatedButton variant="ghost" onClick={onCancel}>
            Cancel
          </AnimatedButton>
        )}
        <AnimatedButton 
          onClick={handleSubmit} 
          loading={loading}
          disabled={!formData.start_date || !formData.end_date || !formData.reason}
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Request
        </AnimatedButton>
      </div>
    </GlassCard>
  );
}