import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8">
        Welcome to your dashboard. Manage your account and settings here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/dashboard/profile"
              className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View Profile
            </Link>
            <Link
              to="/dashboard/settings"
              className="block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
          <div className="space-y-2">
            <p className="text-gray-600">Total Projects: <span className="font-semibold">12</span></p>
            <p className="text-gray-600">Completed Tasks: <span className="font-semibold">89</span></p>
            <p className="text-gray-600">Active Sessions: <span className="font-semibold">3</span></p>
          </div>
        </div>
      </div>

      {/* Nested route content */}
      <Outlet />
    </div>
  );
}
