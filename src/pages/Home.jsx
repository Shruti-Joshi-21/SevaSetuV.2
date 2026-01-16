import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Briefcase,
  Shield,
  Crown,
  MapPin,
  TrendingUp,
  ClipboardList,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Check,
  Leaf
} from 'lucide-react';

const roleKeyMap = {
  'Volunteer': 'volunteer',
  'Staff': 'staff',
  'Team Lead': 'team lead',
  'Administrator': 'admin'
};

const roleCards = [
  {
    role: 'Volunteer',
    icon: Users,
    description: 'Access your attendance records, submit daily reports, and manage your field activities.',
    features: [
      'Clock in/out with location',
      'Submit daily reports',
      'Request leave',
      'View assigned tasks'
    ],
    dashboard: 'VolunteerDashboard',
    color: 'from-emerald-400 to-emerald-600',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-600'
  },
  {
    role: 'Staff',
    icon: Briefcase,
    description: 'Execute assigned field tasks, mark attendance, and submit operational updates.',
    features: [
      'Mark attendance with GPS',
      'View assigned field tasks',
      'Submit work updates',
      'View work schedule'
    ],
    dashboard: 'StaffDashboard',
    color: 'from-teal-400 to-teal-600',
    buttonColor: 'bg-teal-500 hover:bg-teal-600'
  },
  {
    role: 'Team Lead',
    icon: Shield,
    description: 'Manage your team, assign tasks, approve leave requests, and monitor field operations.',
    features: [
      'Team attendance overview',
      'Task assignment & tracking',
      'Leave approval workflow',
      'Team performance reports'
    ],
    dashboard: 'TeamLeadDashboard',
    color: 'from-emerald-600 to-emerald-800',
    buttonColor: 'bg-emerald-700 hover:bg-emerald-800'
  },
  {
    role: 'Administrator',
    icon: Crown,
    description: 'Full system access with analytics, user management, and organizational oversight.',
    features: [
      'Organization-wide analytics',
      'User & role management',
      'System configuration',
      'Advanced reporting'
    ],
    dashboard: 'AdminDashboard',
    color: 'from-amber-400 to-orange-500',
    buttonColor: 'bg-amber-500 hover:bg-amber-600'
  }
];

const features = [
  {
    icon: MapPin,
    title: 'Location Tracking',
    description: 'GPS-enabled attendance with real-time location verification'
  },
  {
    icon: ClipboardList,
    title: 'Leave Management',
    description: 'Leave requests, approvals, and balance tracking'
  },
  {
    icon: TrendingUp,
    title: 'Task Planning',
    description: 'Assign, track, and manage daily field tasks'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Insights and automated performance reports'
  }
];

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#' },
    { label: 'Security', href: '#' }
  ],
  support: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Contact', href: '#contact' }
  ]
};

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modals, setModals] = useState({
    Volunteer: false,
    Staff: false,
    'Team Lead': false,
    Administrator: false
  });
  const [forms, setForms] = useState({
    Volunteer: { username: '', password: '' },
    Staff: { username: '', password: '' },
    'Team Lead': { username: '', password: '' },
    Administrator: { username: '', password: '' }
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setModalOpen = (role, open) => {
    setModals(prev => ({ ...prev, [role]: open }));
  };

  const isModalOpen = (role) => {
    return modals[role];
  };

  const getFormData = (role) => {
    return forms[role];
  };

  const handleFormChange = (role, field, value) => {
    setForms(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const handleLogin = (role) => {
    const form = forms[role];
    if (!form.username.trim() || !form.password.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    // Navigate to login with role parameter
    const roleParam = roleKeyMap[role];
    navigate(`/login?role=${roleParam}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900">

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Streamline Your{' '}
                <span className="text-amber-300">Field</span>{' '}
                Operations
              </h1>
              <p className="text-lg md:text-xl text-emerald-50 mb-8 leading-relaxed">
                Comprehensive attendance tracking, leave management, task planning, and reporting system designed specifically for environmental NGOs and field operations.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {['Location Tracking', 'Real-time Analytics', 'Task Management'].map((feature, i) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm border border-white/30"
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>

              <motion.a
                href="#dashboards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </motion.a>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop"
                  alt="Field workers"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">500+</p>
                    <p className="text-sm text-slate-500">Active Volunteers</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Access Dashboard Section */}
      <section id="dashboards" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Access Your Dashboard
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose your role to get started with SevaSetu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleCards.map((card, index) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Card Header */}
                  <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                      <card.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{card.role}</h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="p-6 flex-1">
                    <ul className="space-y-3 mb-6">
                      {card.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="p-6 pt-0">
                    <Dialog open={isModalOpen(card.role)} onOpenChange={(open) => setModalOpen(card.role, open)}>
                      <motion.button
                        asChild
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 ${card.buttonColor}`}
                      >
                        <button onClick={() => setModalOpen(card.role, true)}>
                          Login as {card.role}
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </motion.button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{card.role} Login</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`${card.role.toLowerCase()}-username`}>Username</Label>
                            <Input
                              id={`${card.role.toLowerCase()}-username`}
                              type="text"
                              value={getFormData(card.role).username}
                              onChange={(e) => handleFormChange(card.role, 'username', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${card.role.toLowerCase()}-password`}>Password</Label>
                            <Input
                              id={`${card.role.toLowerCase()}-password`}
                              type="password"
                              value={getFormData(card.role).password}
                              onChange={(e) => handleFormChange(card.role, 'password', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setModalOpen(card.role, false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              const form = getFormData(card.role);
                              if (form.username && form.password) {
                                setModalOpen(card.role, false);
                                handleLogin(card.role);
                              }
                            }}
                          >
                            Submit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Field Operations
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to manage environmental field work efficiently
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop"
                alt="Environmental work"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Built for Environmental Impact
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                SevaSetu is designed specifically for environmental NGOs and field operations teams who need reliable, 
                modern tools to coordinate volunteers, track attendance, and measure impact.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                From reforestation projects to wildlife conservation, our platform helps you manage field operations 
                with precision and ease.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-emerald-600 mb-2">98%</p>
                  <p className="text-slate-600 dark:text-slate-400">Attendance Accuracy</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-600 mb-2">500+</p>
                  <p className="text-slate-600 dark:text-slate-400">Active Users</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
}