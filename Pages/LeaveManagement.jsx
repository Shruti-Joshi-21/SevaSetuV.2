import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Search,
  Filter,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import LeaveCard from '@/components/leave/LeaveCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function LeaveManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leaveRequests', statusFilter],
    queryFn: () => {
      if (statusFilter === 'all') {
        return base44.entities.LeaveRequest.list('-created_date', 100);
      }
      return base44.entities.LeaveRequest.filter({ status: statusFilter }, '-created_date', 100);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaveRequests']);
      setShowReviewModal(false);
      setSelectedLeave(null);
      setReviewComment('');
    },
  });

  const handleReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const confirmReview = () => {
    reviewMutation.mutate({
      id: selectedLeave.id,
      data: {
        status: reviewAction,
        reviewed_by: user?.email,
        review_date: new Date().toISOString(),
        review_comments: reviewComment
      }
    });
  };

  const filteredRequests = leaveRequests.filter(leave =>
    leave.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    leave.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Leave Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review and approve leave requests from your team
          </p>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Leave Requests Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map((leave, index) => (
              <LeaveCard
                key={leave.id}
                leave={leave}
                showActions={leave.status === 'pending'}
                onApprove={(l) => handleReview(l, 'approved')}
                onReject={(l) => handleReview(l, 'rejected')}
                delay={index * 0.05}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No leave requests found
            </h3>
            <p className="text-slate-500">
              {search || statusFilter !== 'pending'
                ? 'Try adjusting your filters'
                : 'No pending leave requests at the moment'}
            </p>
          </GlassCard>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="font-medium text-slate-900 dark:text-white mb-1">
                  {selectedLeave.user_name}
                </p>
                <p className="text-sm text-slate-500">
                  {format(parseISO(selectedLeave.start_date), 'MMM d')} - {format(parseISO(selectedLeave.end_date), 'MMM d')} ({selectedLeave.days_count} days)
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {selectedLeave.reason}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Comments {reviewAction === 'rejected' && <span className="text-red-400">*</span>}
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={reviewAction === 'rejected' ? 'Please provide a reason...' : 'Optional comments...'}
                  className="min-h-20"
                />
              </div>

              <div className="flex items-center gap-3">
                <AnimatedButton
                  variant="ghost"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant={reviewAction === 'approved' ? 'success' : 'danger'}
                  onClick={confirmReview}
                  loading={reviewMutation.isLoading}
                  disabled={reviewAction === 'rejected' && !reviewComment}
                  className="flex-1"
                >
                  {reviewAction === 'approved' ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                  Confirm
                </AnimatedButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}