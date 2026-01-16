import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Calendar, Plus } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LeaveForm from '@/components/leave/LeaveForm';
import LeaveCard from '@/components/leave/LeaveCard';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function LeaveRequest() {
  const [showForm, setShowForm] = useState(false);
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

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['myLeaveRequests', user?.email],
    queryFn: () => base44.entities.LeaveRequest.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries(['myLeaveRequests']);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Leave Requests
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Request time off and track your leave status
            </p>
          </div>
          
          {!showForm && (
            <AnimatedButton onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </AnimatedButton>
          )}
        </div>

        {/* Leave Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LeaveForm
              user={user}
              userProfile={userProfile}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}

        {/* Leave Requests List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Your Leave History
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : leaveRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveRequests.map((leave, index) => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  delay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No leave requests yet
              </h3>
              <p className="text-slate-500 mb-4">
                Submit your first leave request to get started
              </p>
              <AnimatedButton onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New Request
              </AnimatedButton>
            </GlassCard>
          )}
        </div>
      </div>
    </PageTransition>
  );
}