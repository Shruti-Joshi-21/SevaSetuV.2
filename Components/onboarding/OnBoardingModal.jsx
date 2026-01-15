import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  User,
  Camera,
  Check,
  ChevronRight,
  Phone,
  Building2,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';
import FloatingInput from '../ui/FloatingInput';
import CameraCapture from '../attendance/CameraCapture';
import ProgressRing from '../ui/ProgressRing';

const steps = [
  { id: 'profile', title: 'Profile Info', icon: User },
  { id: 'face', title: 'Face Registration', icon: Camera },
  { id: 'complete', title: 'Complete', icon: Check }
];

export default function OnboardingModal({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: '',
    department: '',
    emergency_contact: ''
  });
  const [errors, setErrors] = useState({});

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!validateProfile()) return;
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (capturedImages.length < 3) {
        setErrors({ face: 'Please capture at least 3 face images' });
        return;
      }
      await completeOnboarding();
    }
  };

  const handleCapture = (imageData) => {
    if (capturedImages.length < 5) {
      setCapturedImages([...capturedImages, imageData]);
    }
    setShowCamera(false);
    setErrors({});
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Upload face images
      const uploadedUrls = [];
      for (const image of capturedImages) {
        const blob = await fetch(image).then(r => r.blob());
        const file = new File([blob], `face_${uploadedUrls.length}.jpg`, { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      // Create or update user profile
      const existingProfiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      
      const profileData = {
        user_email: user.email,
        full_name: formData.full_name,
        user_role: 'volunteer',
        phone: formData.phone,
        department: formData.department,
        emergency_contact: formData.emergency_contact,
        face_data_urls: uploadedUrls,
        onboarding_completed: true,
        last_active: new Date().toISOString()
      };

      if (existingProfiles.length > 0) {
        await base44.entities.UserProfile.update(existingProfiles[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }

      setCurrentStep(2);
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Onboarding error:', error);
      setErrors({ submit: 'Failed to complete onboarding. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-900/90 to-teal-900/90 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg"
        >
          <GlassCard className="p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex flex-col items-center ${
                      index <= currentStep ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      index < currentStep 
                        ? 'bg-emerald-500 text-white' 
                        : index === currentStep 
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500' 
                          : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {index < currentStep ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: index < currentStep ? '100%' : '0%' }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Welcome to EcoOps!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      Let's set up your profile to get started
                    </p>
                  </div>

                  <FloatingInput
                    label="Full Name"
                    icon={User}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    error={errors.full_name}
                    required
                  />
                  <FloatingInput
                    label="Phone Number"
                    icon={Phone}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    required
                  />
                  <FloatingInput
                    label="Department (Optional)"
                    icon={Building2}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                  <FloatingInput
                    label="Emergency Contact"
                    icon={Phone}
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  />
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="face"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Face Registration
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      Capture multiple angles for accurate verification
                    </p>
                  </div>

                  <div className="flex justify-center mb-6">
                    <ProgressRing 
                      progress={(capturedImages.length / 3) * 100} 
                      size={100}
                      color="emerald"
                    >
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {capturedImages.length}/3
                      </span>
                    </ProgressRing>
                  </div>

                  {/* Captured Images Preview */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`aspect-square rounded-xl overflow-hidden ${
                          capturedImages[index] 
                            ? 'border-2 border-emerald-500' 
                            : 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {capturedImages[index] ? (
                          <img 
                            src={capturedImages[index]} 
                            alt={`Face ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center">
                    <AnimatedButton
                      onClick={() => setShowCamera(true)}
                      disabled={capturedImages.length >= 5}
                      variant={capturedImages.length >= 3 ? 'secondary' : 'primary'}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      {capturedImages.length >= 3 ? 'Add More (Optional)' : 'Capture Face'}
                    </AnimatedButton>
                  </div>

                  {errors.face && (
                    <div className="flex items-center gap-2 text-red-500 text-sm justify-center">
                      <AlertCircle className="w-4 h-4" />
                      {errors.face}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    All Set!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Your profile has been created successfully
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 2 && (
              <div className="mt-8 flex justify-end">
                <AnimatedButton
                  onClick={handleNextStep}
                  loading={loading}
                  disabled={currentStep === 1 && capturedImages.length < 3}
                >
                  {currentStep === 1 ? 'Complete Setup' : 'Continue'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </div>
            )}

            {errors.submit && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-sm justify-center">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          mode="onboarding"
        />
      )}
    </>
  );
}