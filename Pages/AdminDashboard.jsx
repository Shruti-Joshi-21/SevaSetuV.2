import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import {
  Users,
  ClipboardCheck,
  MapPin,
  Calendar,
  TrendingUp,
  FileText,
  ChevronRight,
  Activity,
  Award,
  AlertTriangle,
  Clock
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import StatsCard from '@/components/ui/StatsCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import AreaChart from '@/components/charts/AreaChart';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { CardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';

export default function AdminDashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['allTasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['allAttendance'],
    queryFn: () => base44.entities.AttendanceRecord.list('-check_in_time', 100),
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: () => base44.entities.LeaveRequest.filter({ status: 'pending' }, '-created_date', 10),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['allReports'],
    queryFn: () => base44.entities.FieldReport.list('-submission_date', 50),
  });

  // Calculate stats
  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const activeVolunteers = users.filter(u => u.user_role === 'volunteer' && u.is_active).length;
  const thisMonthAttendance = attendance.filter(record => {
    const date = parseISO(record.check_in_time);
    return isWithinInterval(date, {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    });
  });
  const complianceRate = thisMonthAttendance.length > 0
    ? Math.round((thisMonthAttendance.filter(a => a.status === 'auto_approved' || a.status === 'approved').length / thisMonthAttendance.length) * 100)
    : 0;

  // Chart data
  const weeklyData = [
    { name: 'Mon', attendance: 45, tasks: 12 },
    { name: 'Tue', attendance: 52, tasks: 15 },
    { name: 'Wed', attendance: 48, tasks: 10 },
    { name: 'Thu', attendance: 55, tasks: 18 },
    { name: 'Fri', attendance: 60, tasks: 20 },
    { name: 'Sat', attendance: 30, tasks: 8 },
    { name: 'Sun', attendance: 20, tasks: 5 },
  ];

  const taskStatusData = [
    { name: 'Active', value: tasks.filter(t => t.status === 'active').length, color: '#10b981' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#3b82f6' },
    { name: 'Paused', value: tasks.filter(t => t.status === 'paused').length, color: '#f59e0b' },
    { name: 'Draft', value: tasks.filter(t => t.status === 'draft').length, color: '#94a3b8' },
  ];

  const categoryData = [
    { name: 'Conservation', value: 35 },
    { name: 'Clean-up', value: 28 },
    { name: 'Education', value: 22 },
    { name: 'Research', value: 15 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Operations Overview
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor your NGO's field operations and team performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Analytics')}>
              <AnimatedButton variant="secondary">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Tasks"
            value={activeTasks}
            icon={MapPin}
            trend="+12%"
            trendUp={true}
            color="emerald"
            delay={0}
          />
          <StatsCard
            title="Active Volunteers"
            value={activeVolunteers}
            icon={Users}
            trend="+5%"
            trendUp={true}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Compliance Rate"
            value={`${complianceRate}%`}
            icon={ClipboardCheck}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            title="Pending Leave"
            value={leaveRequests.length}
            icon={Calendar}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AreaChart
              data={weeklyData}
              title="Weekly Activity"
              dataKey="attendance"
              color="#10b981"
              height={280}
              delay={0.2}
            />
          </div>
          <DonutChart
            data={taskStatusData}
            title="Task Status"
            centerValue={tasks.length}
            centerLabel="Total Tasks"
            height={200}
            delay={0.3}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Leave Requests */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Pending Leave Requests
                </h3>
                <Link 
                  to={createPageUrl('LeaveManagement')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {leaveRequests.length > 0 ? (
                <div className="space-y-3">
                  {leaveRequests.slice(0, 5).map((leave, index) => (
                    <motion.div
                      key={leave.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {leave.user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {leave.user_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {leave.days_count} day(s) · {leave.leave_type}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={leave.status} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">No pending leave requests</p>
                </div>
              )}
            </GlassCard>

            {/* Recent Reports */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Field Reports
                </h3>
                <Link 
                  to={createPageUrl('ReportManagement')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {report.task_name || 'Field Report'}
                          </p>
                          <p className="text-sm text-slate-500">
                            by {report.submitter_name} · {report.submission_date && format(parseISO(report.submission_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={report.status} size="sm" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">No reports submitted yet</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Distribution */}
            <BarChart
              data={categoryData}
              title="Tasks by Category"
              dataKey="value"
              colorful
              height={200}
              delay={0.4}
            />

            {/* Quick Stats */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                This Month
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">Total Hours</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">1,284h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">Tasks Done</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">Reports</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{reports.length}</span>
                </div>
              </div>
            </GlassCard>

            {/* Top Volunteers */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Top Contributors
              </h3>
              <div className="space-y-3">
                {users.filter(u => u.user_role === 'volunteer').slice(0, 5).map((volunteer, index) => (
                  <motion.div
                    key={volunteer.user_email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-600">
                      {index + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {volunteer.full_name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {volunteer.full_name}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">
                      {volunteer.total_hours_contributed || 0}h
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}