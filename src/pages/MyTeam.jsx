import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Phone,
  Clock,
  Award
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function MyTeam() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['teamTasks', user?.email],
    queryFn: () => base44.entities.Task.filter({ team_lead_email: user.email }),
    enabled: !!user?.email,
  });

  // Get unique volunteer emails from tasks
  const volunteerEmails = [...new Set(tasks.flatMap(t => t.assigned_volunteers || []))];

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ['teamVolunteers', volunteerEmails],
    queryFn: async () => {
      if (volunteerEmails.length === 0) return [];
      const allProfiles = await base44.entities.UserProfile.filter({ user_role: 'volunteer' });
      return allProfiles.filter(p => volunteerEmails.includes(p.user_email));
    },
    enabled: volunteerEmails.length > 0,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['teamAttendance'],
    queryFn: () => base44.entities.AttendanceRecord.list('-check_in_time', 100),
  });

  const getVolunteerStats = (email) => {
    const records = attendance.filter(a => a.user_email === email);
    return {
      totalRecords: records.length,
      approved: records.filter(a => a.status === 'approved' || a.status === 'auto_approved').length,
    };
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            My Team
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View and manage your assigned volunteers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{volunteers.length}</p>
            <p className="text-sm text-slate-500">Team Members</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.status === 'active').length}</p>
            <p className="text-sm text-slate-500">Active Tasks</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">
              {attendance.filter(a => volunteerEmails.includes(a.user_email)).length}
            </p>
            <p className="text-sm text-slate-500">Attendance Records</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">
              {volunteers.reduce((sum, v) => sum + (v.total_hours_contributed || 0), 0)}h
            </p>
            <p className="text-sm text-slate-500">Total Hours</p>
          </GlassCard>
        </div>

        {/* Team Members */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : volunteers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers.map((volunteer, index) => {
              const stats = getVolunteerStats(volunteer.user_email);
              return (
                <motion.div
                  key={volunteer.user_email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                        {volunteer.profile_image_url ? (
                          <img src={volunteer.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-xl font-semibold">
                            {volunteer.full_name?.charAt(0) || 'V'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {volunteer.full_name || 'Volunteer'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${volunteer.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className="text-sm text-slate-500">
                            {volunteer.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{volunteer.user_email}</span>
                      </div>
                      {volunteer.phone && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4" />
                          <span>{volunteer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {volunteer.total_hours_contributed || 0}h
                        </p>
                        <p className="text-xs text-slate-500">Hours</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {stats.totalRecords}
                        </p>
                        <p className="text-xs text-slate-500">Attendance</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-500">
                          {stats.totalRecords > 0 ? Math.round((stats.approved / stats.totalRecords) * 100) : 0}%
                        </p>
                        <p className="text-xs text-slate-500">Approved</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No team members yet
            </h3>
            <p className="text-slate-500">
              Assign volunteers to your tasks to build your team
            </p>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}