import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  MapPin,
  Calendar,
  Users,
  Settings,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Search
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';
import FloatingInput from '../ui/FloatingInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const steps = [
  { id: 'details', title: 'Task Details', icon: FileText },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'schedule', title: 'Schedule', icon: Calendar },
  { id: 'settings', title: 'Settings', icon: Settings },
  { id: 'assign', title: 'Assign', icon: Users }
];

export default function TaskWizard({ isOpen, onClose, onSuccess, editTask }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(editTask || {
    title: '',
    description: '',
    project_name: '',
    location_name: '',
    latitude: null,
    longitude: null,
    location_radius: 100,
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '17:00',
    time_flexibility_minutes: 15,
    attendance_strictness: 'moderate',
    priority: 'medium',
    status: 'draft',
    assigned_volunteers: [],
    tags: []
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.UserProfile.filter({ user_role: 'volunteer', is_active: true }),
  });

  const [searchVolunteer, setSearchVolunteer] = useState('');
  const filteredVolunteers = volunteers.filter(v => 
    v.full_name?.toLowerCase().includes(searchVolunteer.toLowerCase()) ||
    v.user_email?.toLowerCase().includes(searchVolunteer.toLowerCase())
  );

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editTask?.id) {
        await base44.entities.Task.update(editTask.id, formData);
      } else {
        await base44.entities.Task.create(formData);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Task save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVolunteer = (email) => {
    const assigned = formData.assigned_volunteers || [];
    if (assigned.includes(email)) {
      updateField('assigned_volunteers', assigned.filter(e => e !== email));
    } else {
      updateField('assigned_volunteers', [...assigned, email]);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`flex flex-col items-center ${
                      index <= currentStep ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${
                      index < currentStep 
                        ? 'bg-emerald-500 text-white' 
                        : index === currentStep 
                          ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                          : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {index < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: index < currentStep ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Step 0: Details */}
              {currentStep === 0 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <FloatingInput
                    label="Task Title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Describe the task..."
                      className="min-h-24"
                    />
                  </div>
                  <FloatingInput
                    label="Project Name"
                    value={formData.project_name}
                    onChange={(e) => updateField('project_name', e.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                    <Select value={formData.priority} onValueChange={(v) => updateField('priority', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Location */}
              {currentStep === 1 && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <FloatingInput
                    label="Location Name / Address"
                    icon={MapPin}
                    value={formData.location_name}
                    onChange={(e) => updateField('location_name', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                      label="Latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => updateField('latitude', parseFloat(e.target.value) || null)}
                    />
                    <FloatingInput
                      label="Longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => updateField('longitude', parseFloat(e.target.value) || null)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Allowed Radius: {formData.location_radius}m
                      </label>
                    </div>
                    <Slider
                      value={[formData.location_radius]}
                      onValueChange={([v]) => updateField('location_radius', v)}
                      max={500}
                      min={25}
                      step={25}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500">
                      Volunteers must be within this radius to mark attendance
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Schedule */}
              {currentStep === 2 && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateField('start_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => updateField('end_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                      <Input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => updateField('start_time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                      <Input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => updateField('end_time', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Time Flexibility: ±{formData.time_flexibility_minutes} minutes
                    </label>
                    <Slider
                      value={[formData.time_flexibility_minutes]}
                      onValueChange={([v]) => updateField('time_flexibility_minutes', v)}
                      max={60}
                      min={0}
                      step={5}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Attendance Strictness</label>
                    <Select value={formData.attendance_strictness} onValueChange={(v) => updateField('attendance_strictness', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relaxed">Relaxed - Auto-approve all</SelectItem>
                        <SelectItem value="moderate">Moderate - Review major issues</SelectItem>
                        <SelectItem value="strict">Strict - Review all issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Initial Status</label>
                    <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Assign */}
              {currentStep === 4 && (
                <motion.div
                  key="assign"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search volunteers..."
                      value={searchVolunteer}
                      onChange={(e) => setSearchVolunteer(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="border rounded-xl divide-y dark:divide-slate-700 max-h-64 overflow-y-auto">
                    {filteredVolunteers.map((volunteer) => (
                      <div
                        key={volunteer.user_email}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => toggleVolunteer(volunteer.user_email)}
                      >
                        <Checkbox
                          checked={formData.assigned_volunteers?.includes(volunteer.user_email)}
                          onCheckedChange={() => toggleVolunteer(volunteer.user_email)}
                        />
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <span className="text-emerald-600 font-medium">
                            {volunteer.full_name?.charAt(0) || 'V'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{volunteer.full_name}</p>
                          <p className="text-sm text-slate-500">{volunteer.user_email}</p>
                        </div>
                      </div>
                    ))}
                    {filteredVolunteers.length === 0 && (
                      <div className="p-6 text-center text-slate-500">
                        No volunteers found
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {formData.assigned_volunteers?.length || 0} volunteer(s) selected
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <AnimatedButton
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </AnimatedButton>

            {currentStep < steps.length - 1 ? (
              <AnimatedButton onClick={handleNext}>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </AnimatedButton>
            ) : (
              <AnimatedButton
                onClick={handleSubmit}
                loading={loading}
              >
                <Check className="w-5 h-5 mr-1" />
                {editTask ? 'Update Task' : 'Create Task'}
              </AnimatedButton>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}