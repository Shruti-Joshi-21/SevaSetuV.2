import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import DynamicReportForm from '@/components/reports/DynamicReportForm';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function SubmitReport() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['myActiveTasks', user?.email],
    queryFn: async () => {
      const allTasks = await base44.entities.Task.filter({ status: 'active' });
      return allTasks.filter(task => task.assigned_volunteers?.includes(user.email));
    },
    enabled: !!user?.email,
  });

  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['reportTemplate', selectedTask?.report_template_id],
    queryFn: () => base44.entities.ReportTemplate.filter({ id: selectedTask.report_template_id }),
    enabled: !!selectedTask?.report_template_id,
    select: (data) => data[0],
  });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSelectedTask(null);
      setSubmitted(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
            >
              <motion.svg
                className="w-12 h-12 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Report Submitted!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your field report has been submitted successfully
            </p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (selectedTask) {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center gap-1"
            >
              ← Back to Tasks
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Submit Field Report
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Task: {selectedTask.title}
            </p>
          </div>

          {/* Report Form */}
          {templateLoading ? (
            <CardSkeleton />
          ) : template ? (
            <DynamicReportForm
              template={template}
              task={selectedTask}
              user={user}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedTask(null)}
            />
          ) : (
            <GlassCard className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                No Template Available
              </h3>
              <p className="text-slate-500">
                This task doesn't have a report template assigned yet
              </p>
            </GlassCard>
          )}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Submit Field Report
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Select a task to submit your field report
          </p>
        </div>

        {/* Tasks List */}
        {tasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  className="p-5 cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                  hover={true}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">
                        {task.title}
                      </h3>
                      {task.project_name && (
                        <p className="text-sm text-slate-500">{task.project_name}</p>
                      )}
                      {task.location_name && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          📍 {task.location_name}
                        </p>
                      )}
                    </div>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      className="text-emerald-500"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Active Tasks
            </h3>
            <p className="text-slate-500">
              You don't have any active tasks that require reports
            </p>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}