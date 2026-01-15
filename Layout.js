import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Don't require auth for landing page
  const isLandingPage = currentPageName === 'Home';

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (isLandingPage) return null;
      return base44.auth.me();
    },
  });

  const { data: userProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (user && !profileLoading && !userProfile?.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [user, userProfile, profileLoading]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refetchProfile();
  };

  // Determine user role
  const userRole = userProfile?.user_role || 
    (user?.role === 'admin' ? 'admin' : 'volunteer');

  // Page titles
  const pageTitles = {
    AdminDashboard: 'Admin Dashboard',
    TeamLeadDashboard: 'Team Lead Dashboard',
    VolunteerDashboard: 'Volunteer Dashboard',
    StaffDashboard: 'Staff Dashboard',
    TaskManagement: 'Task Management',
    AttendanceManagement: 'Attendance Management',
    AttendanceReview: 'Attendance Review',
    MyAttendance: 'My Attendance',
    MyTasks: 'My Tasks',
    SubmitReport: 'Submit Report',
    FieldReports: 'Field Reports',
    ReportTemplates: 'Report Templates',
    LeaveManagement: 'Leave Management',
    LeaveRequest: 'Leave Request',
    TeamManagement: 'Team Management',
    MyTeam: 'My Team',
    Analytics: 'Analytics',
    Settings: 'Settings',
    Profile: 'Profile',
    ReportManagement: 'Report Management'
  };

  // Landing page - no auth required
  if (isLandingPage) {
    return <>{children}</>;
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <style>{`
        :root {
          --color-primary: #10b981;
          --color-primary-dark: #059669;
        }
        .dark {
          color-scheme: dark;
        }
      `}</style>
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPageName}
          userRole={userRole}
          user={user}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 min-h-screen flex flex-col">
          <TopBar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            pageTitle={pageTitles[currentPageName]}
          />
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {showOnboarding && user && (
        <OnboardingModal
          user={user}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}