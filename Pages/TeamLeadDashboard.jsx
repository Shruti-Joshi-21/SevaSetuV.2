import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import {
  Users,
  ClipboardCheck,
  MapPin,
  AlertTriangle,
  TrendingUp,
  FileText,
  ChevronRight,
  Plus,
  Eye,
  Clock
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import StatsCard from '@/components/ui/StatsCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressRing from '@/components/ui/ProgressRing';
import TaskCard from '@/components/tasks/TaskCard';
import TaskWizard from '@/components/tasks/TaskWizard';
import DonutChart from '@/components/charts/DonutChart';
import { CardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';

export default function TeamLeadDashboard() {
  const [showTaskWizard, setShowTaskWizard] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['teamTasks', user?.email],
    queryFn: () => base44.entities.Task.filter({ team_lead_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: pendingAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['pendingAttendance'],
    queryFn: () => base44.entities.AttendanceRecord.filter({ status: 'pending' }, '-check_in_time', 20),
  });

  const { data: recentReports = [] } = useQuery({
    queryKey: ['recentReports'],
    queryFn: () => base44.entities.FieldReport.filter({}, '-submission_date', 10),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.UserProfile.filter({ user_role: 'volunteer', is_active: true }),
  });

  // Calculate stats
  const activeTasks = tasks.filter(t => t.status === 'active');
  const pendingReviews = pendingAttendance.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  const attendanceData = [
    { name: 'Approved', value: 45, color: '#10b981' },
    { name: 'Pending', value: pendingReviews, color: '#f59e0b' },
    { name: 'Rejected', value: 5, color: '#ef4444' },
  ];

  const handleTaskSuccess = () => {
    queryClient.invalidateQueries(['teamTasks']);
    setShowTaskWizard(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Team Lead Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your team and track field operations
            </p>
          </div>
          
          <AnimatedButton onClick={() => setShowTaskWizard(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </AnimatedButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Tasks"
            value={activeTasks.length}
            icon={MapPin}
            color="emerald"
            delay={0}
          />
          <StatsCard
            title="Pending Reviews"
            value={pendingReviews}
            icon={AlertTriangle}
            color="orange"
            delay={0.1}
          />
          <StatsCard
            title="Team Members"
            value={teamMembers.length}
            icon={Users}
            color="blue"
            delay={0.2}
          />
          <StatsCard
            title="Completed Tasks"
            value={completedTasks}
            icon={ClipboardCheck}
            color="purple"
            delay={0.3}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Active Tasks
              </h2>
              <Link 
                to={createPageUrl('TaskManagement')}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {tasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : activeTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTasks.slice(0, 4).map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            ) : (
              <GlassCard className="p-8 text-center">
                <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  No active tasks
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Create your first task to get started
                </p>
                <AnimatedButton onClick={() => setShowTaskWizard(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Task
                </AnimatedButton>
              </GlassCard>
            )}

            {/* Pending Attendance Reviews */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Pending Attendance Reviews
                </h2>
                <Link 
                  to={createPageUrl('AttendanceReview')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  Review All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {attendanceLoading ? (
                <TableSkeleton rows={3} />
              ) : pendingAttendance.length > 0 ? (
                <GlassCard className="overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingAttendance.slice(0, 5).map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {record.user_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {record.user_name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {record.task_name || 'General Attendance'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-slate-900 dark:text-white">
                              {format(parseISO(record.check_in_time), 'MMM d')}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(parseISO(record.check_in_time), 'h:mm a')}
                            </p>
                          </div>
                          {record.verification_flags?.length > 0 && (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          )}
                          <Link to={createPageUrl('AttendanceReview')}>
                            <AnimatedButton size="sm" variant="secondary">
                              <Eye className="w-4 h-4" />
                            </AnimatedButton>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-6 text-center">
                  <ClipboardCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">
                    All attendance records are reviewed
                  </p>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendance Overview */}
            <DonutChart
              data={attendanceData}
              title="Attendance Overview"
              centerValue={pendingAttendance.length + 50}
              centerLabel="Total"
              delay={0.2}
            />

            {/* Recent Reports */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Recent Reports
                </h3>
                <Link 
                  to={createPageUrl('FieldReports')}
                  className="text-sm text-emerald-600"
                >
                  View All
                </Link>
              </div>
              
              {recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.slice(0, 5).map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          {report.task_name || 'Field Report'}
                        </p>
                        <p className="text-xs text-slate-500">
                          by {report.submitter_name}
                        </p>
                      </div>
                      <StatusBadge status={report.status} size="sm" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  No reports submitted yet
                </p>
              )}
            </GlassCard>

            {/* Team Activity */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Team Activity Today
              </h3>
              <div className="space-y-3">
                {teamMembers.slice(0, 5).map((member, index) => (
                  <motion.div
                    key={member.user_email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.full_name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {member.full_name}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Task Wizard Modal */}
      <AnimatePresence>
        {showTaskWizard && (
          <TaskWizard
            isOpen={showTaskWizard}
            onClose={() => setShowTaskWizard(false)}
            onSuccess={handleTaskSuccess}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}