import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import {
  ClipboardCheck,
  MapPin,
  Calendar,
  Clock,
  Award,
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
import TaskCard from '@/components/tasks/TaskCard';
import AttendanceModal from '@/components/attendance/AttendanceModal';
import { CardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';

export default function VolunteerDashboard() {
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
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

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['myTasks', user?.email],
    queryFn: async () => {
      const allTasks = await base44.entities.Task.filter({ status: 'active' });
      return allTasks.filter(task => 
        task.assigned_volunteers?.includes(user.email)
      );
    },
    enabled: !!user?.email,
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['myAttendance', user?.email],
    queryFn: () => base44.entities.AttendanceRecord.filter({ user_email: user.email }, '-check_in_time', 10),
    enabled: !!user?.email,
  });

  const todaysTasks = tasks.filter(task => {
    if (!task.start_date) return false;
    const start = parseISO(task.start_date);
    const end = task.end_date ? parseISO(task.end_date) : start;
    return isWithinInterval(new Date(), { start, end });
  });

  const thisWeekAttendance = attendance.filter(record => {
    const date = parseISO(record.check_in_time);
    return isWithinInterval(date, {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    });
  });

  const todayAttendance = attendance.find(record => 
    isToday(parseISO(record.check_in_time))
  );

  const handleMarkAttendance = (task = null) => {
    setSelectedTask(task);
    setShowAttendance(true);
  };

  const handleAttendanceSuccess = () => {
    queryClient.invalidateQueries(['myAttendance']);
    setShowAttendance(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Volunteer'}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          
          <AnimatedButton
            onClick={() => handleMarkAttendance(todaysTasks[0])}
            pulse={!todayAttendance}
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            {todayAttendance ? 'View Attendance' : 'Mark Attendance'}
          </AnimatedButton>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Hours"
            value={`${userProfile?.total_hours_contributed || 0}h`}
            icon={Clock}
            color="emerald"
            delay={0}
          />
          <StatsCard
            title="Tasks Completed"
            value={userProfile?.tasks_completed || 0}
            icon={ClipboardCheck}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="This Week"
            value={`${thisWeekAttendance.length} days`}
            icon={Calendar}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            title="Active Tasks"
            value={tasks.length}
            icon={MapPin}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Today's Tasks
              </h2>
              <Link 
                to={createPageUrl('MyTasks')}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {tasksLoading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : todaysTasks.length > 0 ? (
              <div className="space-y-4">
                {todaysTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    delay={index * 0.1}
                    onClick={() => handleMarkAttendance(task)}
                  />
                ))}
              </div>
            ) : (
              <GlassCard className="p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  No tasks for today
                </h3>
                <p className="text-slate-500 text-sm">
                  Check your upcoming tasks or contact your team lead
                </p>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Attendance Status */}
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
                  {todayAttendance.face_match_confidence && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Face Match</span>
                      <span className="font-medium text-emerald-600">
                        {todayAttendance.face_match_confidence.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    Not checked in yet
                  </p>
                  <AnimatedButton
                    size="sm"
                    className="mt-3"
                    onClick={() => handleMarkAttendance(todaysTasks[0])}
                  >
                    Mark Now
                  </AnimatedButton>
                </div>
              )}
            </GlassCard>

            {/* Recent Attendance */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Recent Attendance
              </h3>
              {attendanceLoading ? (
                <TableSkeleton rows={3} />
              ) : attendance.length > 0 ? (
                <div className="space-y-3">
                  {attendance.slice(0, 5).map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          {format(parseISO(record.check_in_time), 'MMM d')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(parseISO(record.check_in_time), 'h:mm a')}
                        </p>
                      </div>
                      <StatusBadge status={record.status} size="sm" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  No attendance records yet
                </p>
              )}
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link to={createPageUrl('SubmitReport')}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Submit Field Report
                    </span>
                  </motion.div>
                </Link>
                <Link to={createPageUrl('LeaveRequest')}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Request Leave
                    </span>
                  </motion.div>
                </Link>
              </div>
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
            task={selectedTask}
            user={user}
            userProfile={userProfile}
            onSuccess={handleAttendanceSuccess}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}