import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserPlus
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import FloatingInput from '@/components/ui/FloatingInput';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function TeamManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('volunteer');
  const [inviting, setInviting] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers', roleFilter],
    queryFn: () => {
      if (roleFilter === 'all') {
        return base44.entities.UserProfile.list('-created_date');
      }
      return base44.entities.UserProfile.filter({ user_role: roleFilter }, '-created_date');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['allUsers']),
  });

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole === 'admin' ? 'admin' : 'user');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('volunteer');
    } catch (error) {
      console.error('Invite error:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = (user, newRole) => {
    updateMutation.mutate({
      id: user.id,
      data: { user_role: newRole }
    });
  };

  const handleStatusToggle = (user) => {
    updateMutation.mutate({
      id: user.id,
      data: { is_active: !user.is_active }
    });
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    team_lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    volunteer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    staff: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const stats = {
    total: users.length,
    volunteers: users.filter(u => u.user_role === 'volunteer').length,
    teamLeads: users.filter(u => u.user_role === 'team_lead').length,
    active: users.filter(u => u.is_active).length,
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Team Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage team members and their roles
            </p>
          </div>
          
          <AnimatedButton onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Member
          </AnimatedButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-slate-500">Total Members</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-500">{stats.volunteers}</p>
                <p className="text-sm text-slate-500">Volunteers</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.teamLeads}</p>
                <p className="text-sm text-slate-500">Team Leads</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Members Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5 relative group">
                  {/* Actions */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                          <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(user, 'volunteer')}>
                          Set as Volunteer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user, 'team_lead')}>
                          Set as Team Lead
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user, 'staff')}>
                          Set as Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                      {user.profile_image_url ? (
                        <img src={user.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-xl font-semibold">
                          {user.full_name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {user.full_name || 'Unknown'}
                        </h3>
                        {!user.is_active && (
                          <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.user_role]}`}>
                        {user.user_role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.user_email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{user.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {user.total_hours_contributed || 0}h contributed
                    </span>
                    <span className="text-slate-500">
                      {user.tasks_completed || 0} tasks
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No members found
            </h3>
            <p className="text-slate-500 mb-4">
              {search || roleFilter !== 'all' ? 'Try adjusting your filters' : 'Invite team members to get started'}
            </p>
            <AnimatedButton onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="w-4 h-4 mr-1" />
              Invite Member
            </AnimatedButton>
          </GlassCard>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <FloatingInput
              label="Email Address"
              type="email"
              icon={Mail}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <AnimatedButton variant="ghost" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </AnimatedButton>
            <AnimatedButton 
              onClick={handleInvite}
              loading={inviting}
              disabled={!inviteEmail}
            >
              Send Invite
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}