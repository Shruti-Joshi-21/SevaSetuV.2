import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MessageSquare,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function FieldReports() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['fieldReports', statusFilter],
    queryFn: () => {
      if (statusFilter === 'all') {
        return base44.entities.FieldReport.list('-submission_date', 50);
      }
      return base44.entities.FieldReport.filter({ status: statusFilter }, '-submission_date', 50);
    },
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FieldReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fieldReports']);
      setSelectedReport(null);
      setReviewComment('');
    },
  });

  const handleApprove = () => {
    if (!selectedReport) return;
    updateMutation.mutate({
      id: selectedReport.id,
      data: {
        status: 'approved',
        reviewed_by: user?.email,
        reviewer_comments: reviewComment || null
      }
    });
  };

  const handleRequestRevision = () => {
    if (!selectedReport || !reviewComment) return;
    updateMutation.mutate({
      id: selectedReport.id,
      data: {
        status: 'revision_needed',
        reviewed_by: user?.email,
        reviewer_comments: reviewComment
      }
    });
  };

  const filteredReports = reports.filter(report =>
    report.task_name?.toLowerCase().includes(search.toLowerCase()) ||
    report.submitter_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Field Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review and manage submitted field reports
          </p>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search reports..."
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="revision_needed">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  className="p-5 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {report.task_name || 'Field Report'}
                        </h4>
                        <p className="text-sm text-slate-500">{report.submitter_name}</p>
                      </div>
                    </div>
                    <StatusBadge status={report.status} size="sm" />
                  </div>

                  {report.images?.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {report.images.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {report.images.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <span className="text-sm text-slate-500">+{report.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-slate-500">
                    {report.submission_date && format(parseISO(report.submission_date), 'MMM d, yyyy h:mm a')}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No reports found
            </h3>
            <p className="text-slate-500">
              Reports submitted by volunteers will appear here
            </p>
          </GlassCard>
        )}
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedReport.task_name}</h3>
                  <p className="text-slate-500">by {selectedReport.submitter_name}</p>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>

              {selectedReport.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedReport.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt="" 
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}

              {selectedReport.report_data && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <h4 className="font-medium">Report Data</h4>
                  {Object.entries(selectedReport.report_data).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between">
                      <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedReport.location_lat && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedReport.location_lat.toFixed(6)}, {selectedReport.location_lng.toFixed(6)}</span>
                </div>
              )}

              {selectedReport.status === 'submitted' && (
                <div className="space-y-4 pt-4 border-t">
                  <Textarea
                    placeholder="Add review comments..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="min-h-20"
                  />
                  <div className="flex gap-3">
                    <AnimatedButton
                      variant="success"
                      className="flex-1"
                      onClick={handleApprove}
                      loading={updateMutation.isLoading}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </AnimatedButton>
                    <AnimatedButton
                      variant="secondary"
                      className="flex-1"
                      onClick={handleRequestRevision}
                      loading={updateMutation.isLoading}
                      disabled={!reviewComment}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Request Revision
                    </AnimatedButton>
                  </div>
                </div>
              )}

              {selectedReport.reviewer_comments && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="font-medium text-amber-700 mb-1">Reviewer Comments</p>
                  <p className="text-amber-600">{selectedReport.reviewer_comments}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}