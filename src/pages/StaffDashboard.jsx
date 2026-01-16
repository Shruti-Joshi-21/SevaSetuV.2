import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO, isToday, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  Building2,
  TrendingUp,
  FileText,
  ChevronRight,
  Zap
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import StatsCard from '@/components/ui/StatsCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import AttendanceModal from '@/components/attendance/AttendanceModal';
import LeaveCard from '@/components/leave/LeaveCard';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function StaffDashboard() {
  const [showAttendance, setShowAttendance] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['myAttendance', user?.email],
    queryFn: () => base44.entities.AttendanceRecord.filter({ user_email: user.email }, '-check_in_time', 30),
    enabled: !!user?.email,
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['myLeaves', user?.email],
    queryFn: () => base44.entities.LeaveRequest.filter({ user_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const todayAttendance = attendance.find(record => 
    isToday(parseISO(record.check_in_time))
  );

  const thisMonthAttendance = attendance.filter(record => {
    const date = parseISO(record.check_in_time);
    return isWithinInterval(date, {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    });
  });

  const handleAttendanceSuccess = () => {
    queryClient.invalidateQueries(['myAttendance']);
    setShowAttendance(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Welcome, {user?.full_name?.split(' ')[0] || 'Staff'}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          
          <AnimatedButton
            onClick={() => setShowAttendance(true)}
            pulse={!todayAttendance}
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            {todayAttendance ? 'View Attendance' : 'Mark Attendance'}
          </AnimatedButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="This Month"
            value={`${thisMonthAttendance.length} days`}
            icon={Calendar}
            color="emerald"
            delay={0}
          />
          <StatsCard
            title="On Time Rate"
            value="95%"
            icon={Clock}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Leave Balance"
            value="12 days"
            icon={Calendar}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            title="Office"
            value={userProfile?.office_location || 'HQ'}
            icon={Building2}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance History */}
          <div className="lg:col-span-2">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Attendance History
                </h3>
                <Link 
                  to={createPageUrl('MyAttendance')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {attendanceLoading ? (
                <CardSkeleton />
              ) : attendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                        <th className="pb-3 font-medium text-slate-500 text-sm">Date</th>
                        <th className="pb-3 font-medium text-slate-500 text-sm">Check In</th>
                        <th className="pb-3 font-medium text-slate-500 text-sm">Check Out</th>
                        <th className="pb-3 font-medium text-slate-500 text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {attendance.slice(0, 10).map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="py-3">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {format(parseISO(record.check_in_time), 'MMM d, yyyy')}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">
                            {format(parseISO(record.check_in_time), 'h:mm a')}
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">
                            {record.check_out_time 
                              ? format(parseISO(record.check_out_time), 'h:mm a')
                              : '—'
                            }
                          </td>
                          <td className="py-3">
                            <StatusBadge status={record.status} size="sm" />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">No attendance records yet</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Status */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Today's Status
              </h3>
              {todayAttendance ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <StatusBadge status={todayAttendance.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Check-in</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {format(parseISO(todayAttendance.check_in_time), 'h:mm a')}
                    </span>
                  </div>
                  {todayAttendance.address && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-500 truncate">
                        📍 {todayAttendance.address}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Not checked in yet</p>
                  <AnimatedButton
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowAttendance(true)}
                  >
                    Mark Now
                  </AnimatedButton>
                </div>
              )}
            </GlassCard>

            {/* Recent Leave Requests */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Leave Requests
                </h3>
                <Link 
                  to={createPageUrl('LeaveRequest')}
                  className="text-sm text-emerald-600"
                >
                  New Request
                </Link>
              </div>
              
              {leaveRequests.length > 0 ? (
                <div className="space-y-3">
                  {leaveRequests.slice(0, 3).map((leave, index) => (
                    <motion.div
                      key={leave.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {leave.leave_type} Leave
                        </span>
                        <StatusBadge status={leave.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(leave.start_date), 'MMM d')} - {format(parseISO(leave.end_date), 'MMM d')}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  No leave requests
                </p>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendance && (
          <AttendanceModal
            isOpen={showAttendance}
            onClose={() => setShowAttendance(false)}
            task={null}
            user={user}
            userProfile={userProfile}
            onSuccess={handleAttendanceSuccess}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}