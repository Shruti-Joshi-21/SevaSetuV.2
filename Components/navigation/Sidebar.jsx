import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Leaf,
  MapPin,
  BarChart3,
  FileBox,
  UserCog
} from 'lucide-react';

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
    { icon: Users, label: 'Team Management', page: 'TeamManagement' },
    { icon: ClipboardCheck, label: 'Attendance', page: 'AttendanceManagement' },
    { icon: MapPin, label: 'Tasks', page: 'TaskManagement' },
    { icon: FileText, label: 'Reports', page: 'ReportManagement' },
    { icon: Calendar, label: 'Leave Requests', page: 'LeaveManagement' },
    { icon: BarChart3, label: 'Analytics', page: 'Analytics' },
    { icon: Settings, label: 'Settings', page: 'Settings' },
  ],
  team_lead: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'TeamLeadDashboard' },
    { icon: MapPin, label: 'My Tasks', page: 'TaskManagement' },
    { icon: ClipboardCheck, label: 'Attendance Review', page: 'AttendanceReview' },
    { icon: FileText, label: 'Field Reports', page: 'FieldReports' },
    { icon: FileBox, label: 'Report Templates', page: 'ReportTemplates' },
    { icon: Users, label: 'My Team', page: 'MyTeam' },
  ],
  volunteer: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'VolunteerDashboard' },
    { icon: ClipboardCheck, label: 'Attendance', page: 'MyAttendance' },
    { icon: MapPin, label: 'My Tasks', page: 'MyTasks' },
    { icon: FileText, label: 'Submit Report', page: 'SubmitReport' },
    { icon: Calendar, label: 'Leave Request', page: 'LeaveRequest' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'StaffDashboard' },
    { icon: ClipboardCheck, label: 'Attendance', page: 'MyAttendance' },
    { icon: Calendar, label: 'Leave Request', page: 'LeaveRequest' },
    { icon: UserCog, label: 'Profile', page: 'Profile' },
  ]
};

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  currentPage, 
  userRole = 'volunteer',
  user,
  onLogout 
}) {
  const items = menuItems[userRole] || menuItems.volunteer;

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 280 : 80,
          x: 0
        }}
        className={cn(
          'fixed left-0 top-0 h-full z-50',
          'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
          'border-r border-slate-200/50 dark:border-slate-700/50',
          'flex flex-col',
          'transition-all duration-300',
          'lg:relative',
          !isOpen && 'max-lg:-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50">
          <motion.div 
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-slate-900 dark:text-white">EcoOps</h1>
              <p className="text-xs text-slate-500">Field Management</p>
            </div>
          </motion.div>
          
          {!isOpen && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto">
              <Leaf className="w-6 h-6 text-white" />
            </div>
          )}
          
          <button
            onClick={onToggle}
            className={cn(
              'p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
              'hidden lg:flex',
              !isOpen && 'absolute -right-4 top-6 bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-700 rounded-full'
            )}
          >
            <motion.div animate={{ rotate: isOpen ? 0 : 180 }}>
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </motion.div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item, index) => {
            const isActive = currentPage === item.page;
            return (
              <motion.div
                key={item.page}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={createPageUrl(item.page)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'group relative',
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full"
                    />
                  )}
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'text-emerald-500'
                  )} />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {user && (
            <div className={cn(
              'flex items-center gap-3 mb-4',
              !isOpen && 'justify-center'
            )}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate capitalize">
                      {userRole?.replace('_', ' ')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <button
            onClick={onLogout}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full',
              'text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600',
              'transition-all duration-200',
              !isOpen && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}