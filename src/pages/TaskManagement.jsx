import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import TaskCard from '@/components/tasks/TaskCard';
import TaskWizard from '@/components/tasks/TaskWizard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function TaskManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [editTask, setEditTask] = useState(null);
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

  const isAdmin = user?.role === 'admin' || userProfile?.user_role === 'admin';

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: async () => {
      if (isAdmin) {
        if (statusFilter === 'all') return base44.entities.Task.list('-created_date');
        return base44.entities.Task.filter({ status: statusFilter }, '-created_date');
      } else {
        const allTasks = statusFilter === 'all' 
          ? await base44.entities.Task.list('-created_date')
          : await base44.entities.Task.filter({ status: statusFilter }, '-created_date');
        return allTasks.filter(t => t.team_lead_email === user?.email);
      }
    },
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(search.toLowerCase()) ||
    task.project_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (task) => {
    setEditTask(task);
    setShowWizard(true);
  };

  const handleStatusChange = (task, newStatus) => {
    updateMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  const handleWizardSuccess = () => {
    queryClient.invalidateQueries(['tasks']);
    setShowWizard(false);
    setEditTask(null);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Task Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage field operation tasks
            </p>
          </div>
          
          <AnimatedButton onClick={() => { setEditTask(null); setShowWizard(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </AnimatedButton>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <TaskCard task={task} delay={0} showProgress={true} />
                
                {/* Action Menu Overlay */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                        <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(task)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                      {task.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(task, 'active')}>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {task.status === 'active' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(task, 'paused')}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(task, 'completed')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                          </DropdownMenuItem>
                        </>
                      )}
                      {task.status === 'paused' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(task, 'active')}>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => deleteMutation.mutate(task.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <MapPin className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-slate-500 mb-4">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            <AnimatedButton onClick={() => setShowWizard(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create Task
            </AnimatedButton>
          </GlassCard>
        )}
      </div>

      {/* Task Wizard */}
      <AnimatePresence>
        {showWizard && (
          <TaskWizard
            isOpen={showWizard}
            onClose={() => { setShowWizard(false); setEditTask(null); }}
            onSuccess={handleWizardSuccess}
            editTask={editTask}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}