import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const roleDashboardMap = {
  volunteer: '/VolunteerDashboard',
  staff: '/StaffDashboard',
  admin: '/AdminDashboard',
  'team lead': '/TeamLeadDashboard'
};

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const role = searchParams.get('role');
  const returnUrl = searchParams.get('returnUrl');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (user && userProfile) {
      // User is already logged in, redirect to appropriate dashboard
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        const dashboard = roleDashboardMap[storedRole] || '/';
        navigate(returnUrl || dashboard, { replace: true });
      } else {
        // Fallback to userProfile role if no stored role
        const userRole = userProfile.user_role?.toLowerCase();
        localStorage.setItem('userRole', userRole);
        const dashboard = roleDashboardMap[userRole] || '/';
        navigate(returnUrl || dashboard, { replace: true });
      }
    }
  }, [user, userProfile, navigate, returnUrl]);

  useEffect(() => {
    if (user && userProfile && role) {
      // After login, store the selected role and redirect
      localStorage.setItem('userRole', role);
      const dashboard = roleDashboardMap[role];
      if (dashboard) {
        navigate(dashboard, { replace: true });
      }
    }
  }, [user, userProfile, role, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.auth.login(formData.email, formData.password);
      queryClient.invalidateQueries(['currentUser']);
      // After successful login, the useEffect will handle the redirect
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (show message to user)
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Login</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:text-blue-800">
          Sign up
        </Link>
      </p>

      <div className="text-center mt-4">
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
