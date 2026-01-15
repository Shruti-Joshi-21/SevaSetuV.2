import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Upload,
  X,
  Check,
  Loader2,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';
import FloatingInput from '../ui/FloatingInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function DynamicReportForm({ 
  template, 
  task, 
  user, 
  onSubmit, 
  onCancel,
  initialData = {}
}) {
  const [formData, setFormData] = useState(initialData);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState(null);

  const updateField = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const captureLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const reportData = {
        task_id: task?.id,
        task_name: task?.title,
        submitted_by: user?.email,
        submitter_name: user?.full_name,
        submission_date: new Date().toISOString(),
        report_data: formData,
        images,
        location_lat: location?.lat,
        location_lng: location?.lng,
        status: 'submitted'
      };

      await base44.entities.FieldReport.create(reportData);
      onSubmit?.(reportData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field, index) => {
    const delay = index * 0.05;

    switch (field.type) {
      case 'text':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
          >
            <FloatingInput
              label={field.label}
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
            />
          </motion.div>
        );

      case 'number':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
          >
            <FloatingInput
              label={field.label}
              type="number"
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, parseFloat(e.target.value))}
              required={field.required}
            />
          </motion.div>
        );

      case 'textarea':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <Textarea
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-24"
            />
          </motion.div>
        );

      case 'dropdown':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <Select 
              value={formData[field.id] || ''} 
              onValueChange={(v) => updateField(field.id, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        );

      case 'checkbox':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex items-center gap-3"
          >
            <Checkbox
              checked={formData[field.id] || false}
              onCheckedChange={(checked) => updateField(field.id, checked)}
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {field.label}
            </label>
          </motion.div>
        );

      case 'date':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <Input
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {template?.name || 'Field Report'}
        </h3>
        {template?.description && (
          <p className="text-sm text-slate-500 mt-1">{template.description}</p>
        )}
      </div>

      <div className="space-y-5">
        {template?.fields?.map((field, index) => renderField(field, index))}

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (template?.fields?.length || 0) * 0.05 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Photos
          </label>
          
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">Add</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (template?.fields?.length || 0) * 0.05 + 0.1 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Location
          </label>
          
          {location ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
            </div>
          ) : (
            <AnimatedButton variant="secondary" size="sm" onClick={captureLocation}>
              <MapPin className="w-4 h-4 mr-2" />
              Capture Current Location
            </AnimatedButton>
          )}
        </motion.div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <AnimatedButton variant="ghost" onClick={onCancel}>
          Cancel
        </AnimatedButton>
        <AnimatedButton onClick={handleSubmit} loading={submitting}>
          <Upload className="w-5 h-5 mr-2" />
          Submit Report
        </AnimatedButton>
      </div>
    </GlassCard>
  );
}