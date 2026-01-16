import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Camera,
  Save,
  Shield
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import FloatingInput from '@/components/ui/FloatingInput';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      const profile = profiles[0] || null;
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          department: profile.department || '',
          emergency_contact: profile.emergency_contact || '',
        });
      }
      return profile;
    },
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          <CardSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal information
          </p>
        </div>

        {/* Profile Card */}
        <GlassCard className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
                {userProfile?.profile_image_url ? (
                  <img 
                    src={userProfile.profile_image_url} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-white text-3xl font-semibold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
              {user?.full_name || 'User'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-500 capitalize">
                {userProfile?.user_role?.replace('_', ' ') || 'Member'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <FloatingInput
              label="Full Name"
              icon={User}
              value={editing ? formData.full_name : userProfile?.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!editing}
            />
            <FloatingInput
              label="Email"
              icon={Mail}
              value={user?.email || ''}
              disabled
            />
            <FloatingInput
              label="Phone Number"
              icon={Phone}
              value={editing ? formData.phone : userProfile?.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
            />
            <FloatingInput
              label="Department"
              icon={Building2}
              value={editing ? formData.department : userProfile?.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              disabled={!editing}
            />
            <FloatingInput
              label="Emergency Contact"
              icon={Phone}
              value={editing ? formData.emergency_contact : userProfile?.emergency_contact || ''}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            {editing ? (
              <>
                <AnimatedButton variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton 
                  onClick={handleSave}
                  loading={updateMutation.isLoading}
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </AnimatedButton>
              </>
            ) : (
              <AnimatedButton onClick={() => setEditing(true)}>
                Edit Profile
              </AnimatedButton>
            )}
          </div>
        </GlassCard>

        {/* Face Data */}
        {userProfile?.face_data_urls?.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Registered Face Data
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {userProfile.face_data_urls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-square rounded-xl overflow-hidden border-2 border-emerald-500"
                >
                  <img src={url} alt={`Face ${index + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              These images are used for attendance verification
            </p>
          </GlassCard>
        )}

        {/* Stats */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Contribution Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {userProfile?.total_hours_contributed || 0}h
              </p>
              <p className="text-sm text-slate-500">Hours Contributed</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-500">
                {userProfile?.tasks_completed || 0}
              </p>
              <p className="text-sm text-slate-500">Tasks Completed</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}