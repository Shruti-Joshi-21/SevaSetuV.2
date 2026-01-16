import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function MyAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['myAttendance', user?.email],
    queryFn: () => base44.entities.AttendanceRecord.filter({ user_email: user.email }, '-check_in_time', 100),
    enabled: !!user?.email,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDay = (day) => {
    return attendance.find(record => 
      isSameDay(parseISO(record.check_in_time), day)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  const monthAttendance = attendance.filter(record => {
    const date = parseISO(record.check_in_time);
    return date >= monthStart && date <= monthEnd;
  });

  const stats = {
    total: monthAttendance.length,
    approved: monthAttendance.filter(a => a.status === 'approved' || a.status === 'auto_approved').length,
    pending: monthAttendance.filter(a => a.status === 'pending').length,
    rejected: monthAttendance.filter(a => a.status === 'rejected').length,
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            My Attendance
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track your attendance history and status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Days</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{stats.approved}</p>
            <p className="text-sm text-slate-500">Approved</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-sm text-slate-500">Pending</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
            <p className="text-sm text-slate-500">Rejected</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </AnimatedButton>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month start */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Days of month */}
                {daysInMonth.map((day, index) => {
                  const record = getAttendanceForDay(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => record && setSelectedRecord(record)}
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center
                        transition-all duration-200 relative
                        ${isCurrentDay ? 'ring-2 ring-emerald-500' : ''}
                        ${record ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
                      `}
                    >
                      <span className={`text-sm ${isCurrentDay ? 'font-bold text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {format(day, 'd')}
                      </span>
                      {record && (
                        <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(record.status)}`} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Rejected</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Selected Record Details */}
          <div>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Details
              </h3>
              
              {selectedRecord ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {format(parseISO(selectedRecord.check_in_time), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge status={selectedRecord.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {format(parseISO(selectedRecord.check_in_time), 'h:mm a')}
                    </span>
                  </div>
                  {selectedRecord.face_match_confidence && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Face Match</span>
                      <span className="font-medium text-emerald-600">
                        {selectedRecord.face_match_confidence.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {selectedRecord.task_name && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 mb-1">Task</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedRecord.task_name}
                      </p>
                    </div>
                  )}
                  {selectedRecord.address && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 mb-1">Location</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedRecord.address}
                      </p>
                    </div>
                  )}
                  {selectedRecord.verification_flags?.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-amber-600 font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Flags
                      </p>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {selectedRecord.verification_flags.map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedRecord.face_image_url && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 mb-2">Photo</p>
                      <img 
                        src={selectedRecord.face_image_url} 
                        alt="Attendance" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">
                    Click on a day with attendance to view details
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}