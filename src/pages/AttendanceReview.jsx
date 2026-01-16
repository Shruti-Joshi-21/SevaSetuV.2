import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  MapPin,
  User,
  Clock,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function AttendanceReview() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendanceReview', statusFilter],
    queryFn: () => {
      if (statusFilter === 'all') {
        return base44.entities.AttendanceRecord.list('-check_in_time', 50);
      }
      return base44.entities.AttendanceRecord.filter({ status: statusFilter }, '-check_in_time', 50);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AttendanceRecord.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendanceReview']);
      setSelectedRecord(null);
      setRejectionReason('');
    },
  });

  const handleApprove = (record) => {
    updateMutation.mutate({
      id: record.id,
      data: {
        status: 'approved',
        approved_by: user?.email
      }
    });
  };

  const handleReject = (record) => {
    updateMutation.mutate({
      id: record.id,
      data: {
        status: 'rejected',
        rejection_reason: rejectionReason,
        approved_by: user?.email
      }
    });
  };

  const filteredAttendance = attendance.filter(record =>
    record.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    record.task_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Attendance Review
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review and approve attendance submissions
          </p>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name or task..."
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
                <SelectItem value="auto_approved">Auto Approved</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Records List */}
          <div className="space-y-4">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : filteredAttendance.length > 0 ? (
              filteredAttendance.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard 
                    className={`p-4 cursor-pointer transition-all ${
                      selectedRecord?.id === record.id 
                        ? 'ring-2 ring-emerald-500' 
                        : ''
                    }`}
                    onClick={() => setSelectedRecord(record)}
                    hover={true}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
                          {record.face_image_url ? (
                            <img src={record.face_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold">
                              {record.user_name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {record.user_name}
                          </h4>
                          <p className="text-sm text-slate-500">{record.task_name || 'General'}</p>
                        </div>
                      </div>
                      <StatusBadge status={record.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(parseISO(record.check_in_time), 'MMM d, h:mm a')}
                      </span>
                      {record.face_match_confidence && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Camera className="w-4 h-4" />
                          {record.face_match_confidence.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    {record.verification_flags?.length > 0 && (
                      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {record.verification_flags.length} issue(s) detected
                        </p>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <GlassCard className="p-8 text-center">
                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400">
                  No records to review
                </p>
              </GlassCard>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <GlassCard className="p-6">
              {selectedRecord ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Review Details
                    </h3>
                    <StatusBadge status={selectedRecord.status} />
                  </div>

                  {/* Face Image */}
                  {selectedRecord.face_image_url && (
                    <div className="relative">
                      <img 
                        src={selectedRecord.face_image_url} 
                        alt="Attendance"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      {selectedRecord.face_match_confidence && (
                        <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/60 rounded-full">
                          <span className="text-white text-sm font-medium">
                            {selectedRecord.face_match_confidence.toFixed(1)}% match
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Volunteer</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {selectedRecord.user_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Check-in Time</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {format(parseISO(selectedRecord.check_in_time), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    {selectedRecord.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {selectedRecord.address}
                          </p>
                          {selectedRecord.distance_from_task && (
                            <p className={`text-sm ${
                              selectedRecord.distance_from_task > 100 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                            }`}>
                              {selectedRecord.distance_from_task}m from task location
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flags */}
                  {selectedRecord.verification_flags?.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <p className="font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Issues Detected
                      </p>
                      <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-500">
                        {selectedRecord.verification_flags.map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedRecord.status === 'pending' && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Textarea
                        placeholder="Rejection reason (optional for approval)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="h-20"
                      />
                      <div className="flex gap-3">
                        <AnimatedButton
                          variant="success"
                          className="flex-1"
                          onClick={() => handleApprove(selectedRecord)}
                          loading={updateMutation.isLoading}
                        >
                          <Check className="w-5 h-5 mr-1" />
                          Approve
                        </AnimatedButton>
                        <AnimatedButton
                          variant="danger"
                          className="flex-1"
                          onClick={() => handleReject(selectedRecord)}
                          loading={updateMutation.isLoading}
                          disabled={!rejectionReason}
                        >
                          <X className="w-5 h-5 mr-1" />
                          Reject
                        </AnimatedButton>
                      </div>
                    </div>
                  )}

                  {selectedRecord.rejection_reason && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        {selectedRecord.rejection_reason}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Select a Record
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Click on an attendance record to view details and take action
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}