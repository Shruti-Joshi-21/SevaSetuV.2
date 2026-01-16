import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const roleDashboardMap = {
  volunteer: '/VolunteerDashboard',
  staff: '/StaffDashboard',
  admin: '/AdminDashboard',
  'team lead': '/TeamLeadDashboard'
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the current path as return URL
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = localStorage.getItem('userRole');
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirect to user's own dashboard
      const userDashboard = roleDashboardMap[userRole] || '/';
      return <Navigate to={userDashboard} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
