import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">SevaSetu</h1>
                <p className="text-xs text-slate-500">Field Operations Management</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                Home
              </a>
              <a href="#features" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                Features
              </a>
              <a href="#about" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                About
              </a>
              <a href="#contact" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                Contact
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col space-y-3">
                <a href="#home" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 py-2">
                  Home
                </a>
                <a href="#features" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 py-2">
                  Features
                </a>
                <a href="#about" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 py-2">
                  About
                </a>
                <a href="#contact" className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 py-2">
                  Contact
                </a>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

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
                    <Link to={createPageUrl(card.dashboard)}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 ${card.buttonColor}`}
                      >
                        Login as {card.role}
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
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

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 dark:bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Logo Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">SevaSetu</h3>
                  <p className="text-xs text-slate-400">Field Operations</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering environmental organizations with smart field operations management.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4 text-emerald-400">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold mb-4 text-emerald-400">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-emerald-400">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-12 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 SevaSetu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}