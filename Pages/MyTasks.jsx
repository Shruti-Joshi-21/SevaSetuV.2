import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isWithinInterval, isPast, isFuture } from 'date-fns';
import {
  MapPin,
  Calendar,
  Filter,
  Search,
  Clock,
  ClipboardCheck
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import TaskCard from '@/components/tasks/TaskCard';
import AttendanceModal from '@/components/attendance/AttendanceModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function MyTasks() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
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

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['myTasks', user?.email],
    queryFn: async () => {
      const allTasks = await base44.entities.Task.list('-start_date');
      return allTasks.filter(task => 
        task.assigned_volunteers?.includes(user.email)
      );
    },
    enabled: !!user?.email,
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(search.toLowerCase()) ||
                         task.project_name?.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'today') {
      const start = task.start_date ? parseISO(task.start_date) : null;
      const end = task.end_date ? parseISO(task.end_date) : start;
      matchesStatus = start && isWithinInterval(new Date(), { start, end });
    } else if (statusFilter === 'upcoming') {
      const start = task.start_date ? parseISO(task.start_date) : null;
      matchesStatus = start && isFuture(start);
    } else if (statusFilter === 'completed') {
      matchesStatus = task.status === 'completed';
    } else if (statusFilter === 'active') {
      matchesStatus = task.status === 'active';
    }

    return matchesSearch && matchesStatus;
  });

  const handleTaskClick = (task) => {
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              My Tasks
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and manage your assigned tasks
            </p>
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                delay={index * 0.05}
                onClick={() => handleTaskClick(task)}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <MapPin className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-slate-500">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'You have no assigned tasks yet'}
            </p>
          </GlassCard>
        )}
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendance && selectedTask && (
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