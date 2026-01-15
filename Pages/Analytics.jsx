import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, subMonths } from 'date-fns';
import {
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import StatsCard from '@/components/ui/StatsCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import AreaChart from '@/components/charts/AreaChart';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');

  const { data: tasks = [] } = useQuery({
    queryKey: ['allTasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['allAttendance'],
    queryFn: () => base44.entities.AttendanceRecord.list('-check_in_time', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.UserProfile.list('-created_date'),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['allReports'],
    queryFn: () => base44.entities.FieldReport.list('-submission_date', 100),
  });

  // Calculate date range
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(dateRange));

  // Filter data by date range
  const filteredAttendance = attendance.filter(a => {
    const date = parseISO(a.check_in_time);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });

  // Calculate metrics
  const totalHours = filteredAttendance.length * 8; // Assuming 8 hours per attendance
  const activeVolunteers = users.filter(u => u.user_role === 'volunteer' && u.is_active).length;
  const complianceRate = filteredAttendance.length > 0
    ? Math.round((filteredAttendance.filter(a => a.status === 'approved' || a.status === 'auto_approved').length / filteredAttendance.length) * 100)
    : 0;
  const avgDailyAttendance = Math.round(filteredAttendance.length / parseInt(dateRange));

  // Daily attendance trend
  const dailyData = [];
  for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
    const day = subDays(endDate, i);
    const dayAttendance = attendance.filter(a => {
      const date = parseISO(a.check_in_time);
      return format(date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });
    dailyData.push({
      name: format(day, 'MMM d'),
      attendance: dayAttendance.length,
      approved: dayAttendance.filter(a => a.status === 'approved' || a.status === 'auto_approved').length
    });
  }

  // Task status distribution
  const taskStatusData = [
    { name: 'Active', value: tasks.filter(t => t.status === 'active').length, color: '#10b981' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#3b82f6' },
    { name: 'Paused', value: tasks.filter(t => t.status === 'paused').length, color: '#f59e0b' },
    { name: 'Draft', value: tasks.filter(t => t.status === 'draft').length, color: '#94a3b8' },
  ];

  // Attendance by status
  const attendanceStatusData = [
    { name: 'Auto Approved', value: filteredAttendance.filter(a => a.status === 'auto_approved').length, color: '#10b981' },
    { name: 'Approved', value: filteredAttendance.filter(a => a.status === 'approved').length, color: '#3b82f6' },
    { name: 'Pending', value: filteredAttendance.filter(a => a.status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: filteredAttendance.filter(a => a.status === 'rejected').length, color: '#ef4444' },
  ];

  // Top volunteers by attendance
  const volunteerAttendance = {};
  filteredAttendance.forEach(a => {
    if (!volunteerAttendance[a.user_name]) {
      volunteerAttendance[a.user_name] = 0;
    }
    volunteerAttendance[a.user_name]++;
  });
  const topVolunteers = Object.entries(volunteerAttendance)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name: name || 'Unknown', value }));

  // Monthly comparison
  const thisMonth = attendance.filter(a => {
    const date = parseISO(a.check_in_time);
    return isWithinInterval(date, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  }).length;
  
  const lastMonth = attendance.filter(a => {
    const date = parseISO(a.check_in_time);
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
  }).length;

  const monthlyGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track your NGO's field operations performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <AnimatedButton variant="secondary">
              <Download className="w-5 h-5 mr-2" />
              Export
            </AnimatedButton>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Hours"
            value={`${totalHours}h`}
            icon={Clock}
            trend={`${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`}
            trendUp={monthlyGrowth > 0}
            color="emerald"
            delay={0}
          />
          <StatsCard
            title="Active Volunteers"
            value={activeVolunteers}
            icon={Users}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Compliance Rate"
            value={`${complianceRate}%`}
            icon={TrendingUp}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            title="Avg Daily Attendance"
            value={avgDailyAttendance}
            icon={MapPin}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AreaChart
              data={dailyData.slice(-14)}
              title="Attendance Trend"
              dataKey="attendance"
              color="#10b981"
              height={300}
              delay={0.2}
            />
          </div>
          <DonutChart
            data={attendanceStatusData}
            title="Attendance Status"
            centerValue={filteredAttendance.length}
            centerLabel="Total"
            height={220}
            delay={0.3}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart
            data={taskStatusData}
            title="Task Distribution"
            centerValue={tasks.length}
            centerLabel="Tasks"
            height={220}
            delay={0.4}
          />
          <BarChart
            data={topVolunteers}
            title="Top Contributors"
            dataKey="value"
            colorful
            height={250}
            delay={0.5}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Period Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Attendance Records</span>
                <span className="font-bold text-slate-900 dark:text-white">{filteredAttendance.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Field Reports</span>
                <span className="font-bold text-slate-900 dark:text-white">{reports.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Tasks Completed</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Verification Quality
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Avg Face Match</span>
                <span className="font-bold text-emerald-600">92.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Location Accuracy</span>
                <span className="font-bold text-emerald-600">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Auto-Approved</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {filteredAttendance.filter(a => a.status === 'auto_approved').length}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Team Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Users</span>
                <span className="font-bold text-slate-900 dark:text-white">{users.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Volunteers</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {users.filter(u => u.user_role === 'volunteer').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Team Leads</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {users.filter(u => u.user_role === 'team_lead').length}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}