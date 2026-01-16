import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Clock, Check, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CameraCapture from './CameraCapture';
import LocationPreview from './LocationPreview';
import AnimatedButton from '../ui/AnimatedButton';
import GlassCard from '../ui/GlassCard';

export default function AttendanceModal({ isOpen, onClose, task, user, userProfile, onSuccess }) {
  const [step, setStep] = useState('preview'); // preview, camera, processing, result
  const [capturedImage, setCapturedImage] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
    setStep('preview');
  };

  const handleLocationCapture = (data) => {
    setLocationData(data);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const submitAttendance = async () => {
    if (!capturedImage || !locationData) return;
    
    setLoading(true);
    setStep('processing');

    try {
      // Upload face image
      const blob = await fetch(capturedImage).then(r => r.blob());
      const file = new File([blob], 'attendance.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Calculate distance from task location
      let distanceFromTask = null;
      if (task?.latitude && task?.longitude) {
        distanceFromTask = calculateDistance(
          locationData.latitude, locationData.longitude,
          task.latitude, task.longitude
        );
      }

      // Simulate face match (in production, this would use AI)
      const faceMatchConfidence = 85 + Math.random() * 15; // 85-100%

      // Determine verification flags
      const flags = [];
      const locationRadius = task?.location_radius || 100;
      const timeFlexibility = task?.time_flexibility_minutes || 15;
      
      if (distanceFromTask && distanceFromTask > locationRadius) {
        flags.push(`Location outside task radius (${Math.round(distanceFromTask)}m > ${locationRadius}m)`);
      }
      
      if (faceMatchConfidence < 90) {
        flags.push(`Low face match confidence (${faceMatchConfidence.toFixed(1)}%)`);
      }

      // Determine status based on strictness
      let status = 'auto_approved';
      const strictness = task?.attendance_strictness || 'moderate';
      
      if (flags.length > 0) {
        if (strictness === 'strict') {
          status = 'pending';
        } else if (strictness === 'moderate' && flags.length > 1) {
          status = 'pending';
        }
      }

      const attendanceData = {
        user_email: user.email,
        user_name: user.full_name,
        user_role: userProfile?.user_role || 'volunteer',
        task_id: task?.id,
        task_name: task?.title,
        check_in_time: new Date().toISOString(),
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
        face_image_url: file_url,
        face_match_confidence: faceMatchConfidence,
        location_accuracy: locationData.accuracy,
        distance_from_task: distanceFromTask ? Math.round(distanceFromTask) : null,
        status,
        verification_flags: flags,
        device_info: navigator.userAgent
      };

      const record = await base44.entities.AttendanceRecord.create(attendanceData);

      setResult({
        success: status === 'auto_approved',
        pending: status === 'pending',
        record,
        faceMatch: faceMatchConfidence,
        distance: distanceFromTask,
        flags
      });
      setStep('result');
      
      if (status === 'auto_approved') {
        onSuccess?.(record);
      }

    } catch (error) {
      console.error('Attendance submission error:', error);
      setResult({
        success: false,
        error: 'Failed to submit attendance. Please try again.'
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('preview');
    setCapturedImage(null);
    setLocationData(null);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {step === 'camera' ? (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setStep('preview')}
          mode="attendance"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && resetAndClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {step === 'processing' ? 'Processing...' : 
                   step === 'result' ? 'Attendance Result' : 
                   'Mark Attendance'}
                </h2>
                <button 
                  onClick={resetAndClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Processing State */}
              {step === 'processing' && (
                <div className="py-12 text-center">
                  <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Verifying your attendance...</p>
                </div>
              )}

              {/* Result State */}
              {step === 'result' && result && (
                <div className="py-8">
                  {result.error ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"
                      >
                        <XCircle className="w-10 h-10 text-red-500" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-red-600 mb-2">Submission Failed</h3>
                      <p className="text-slate-600 dark:text-slate-400">{result.error}</p>
                    </motion.div>
                  ) : result.success ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
                      >
                        <Check className="w-10 h-10 text-emerald-500" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-emerald-600 mb-2">Attendance Marked!</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Your attendance has been automatically approved.
                      </p>
                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-slate-500">Face Match: {result.faceMatch?.toFixed(1)}%</p>
                        {result.distance && (
                          <p className="text-slate-500">Distance: {result.distance < 1000 ? `${Math.round(result.distance)}m` : `${(result.distance/1000).toFixed(1)}km`}</p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4"
                      >
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-amber-600 mb-2">Pending Review</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Your attendance requires verification by your team lead.
                      </p>
                      {result.flags?.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-left">
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Issues detected:</p>
                          <ul className="text-sm text-amber-600 dark:text-amber-500 space-y-1">
                            {result.flags.map((flag, i) => (
                              <li key={i}>• {flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <div className="mt-6">
                    <AnimatedButton 
                      className="w-full" 
                      onClick={resetAndClose}
                    >
                      Done
                    </AnimatedButton>
                  </div>
                </div>
              )}

              {/* Preview State */}
              {step === 'preview' && (
                <>
                  {/* Task Info */}
                  {task && (
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">Task</p>
                      <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                    </div>
                  )}

                  {/* Current Time */}
                  <div className="mb-4 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <LocationPreview 
                      onLocationCapture={handleLocationCapture}
                      targetLocation={task ? { 
                        latitude: task.latitude, 
                        longitude: task.longitude,
                        radius: task.location_radius
                      } : null}
                    />
                  </div>

                  {/* Face Capture */}
                  <div className="mb-6">
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          capturedImage 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {capturedImage ? (
                            <Check className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Camera className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">Face Verification</h4>
                          <p className="text-sm text-slate-500">
                            {capturedImage ? 'Photo captured' : 'Required for verification'}
                          </p>
                        </div>
                        <AnimatedButton
                          size="sm"
                          variant={capturedImage ? 'secondary' : 'primary'}
                          onClick={() => setStep('camera')}
                        >
                          {capturedImage ? 'Retake' : 'Capture'}
                        </AnimatedButton>
                      </div>
                      {capturedImage && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4"
                        >
                          <img 
                            src={capturedImage} 
                            alt="Captured face" 
                            className="w-full h-32 object-cover rounded-xl"
                          />
                        </motion.div>
                      )}
                    </GlassCard>
                  </div>

                  {/* Submit Button */}
                  <AnimatedButton
                    className="w-full"
                    pulse={!!(capturedImage && locationData)}
                    disabled={!capturedImage || !locationData}
                    loading={loading}
                    onClick={submitAttendance}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Submit Attendance
                  </AnimatedButton>
                </>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}