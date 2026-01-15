import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Hash,
  AlignLeft,
  List,
  CheckSquare,
  Calendar,
  Image,
  Save,
  X
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';
import FloatingInput from '../ui/FloatingInput';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const fieldTypes = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'textarea', label: 'Long Text', icon: AlignLeft },
  { id: 'dropdown', label: 'Dropdown', icon: List },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'image', label: 'Image', icon: Image },
];

export default function TemplateBuilder({ template, onSave, onCancel }) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [fields, setFields] = useState(template?.fields || []);
  const [saving, setSaving] = useState(false);

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      required: false,
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
      placeholder: ''
    };
    setFields([...fields, newField]);
  };

  const updateField = (index, updates) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addOption = (fieldIndex) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, {
      options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    });
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const field = fields[fieldIndex];
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldIndex, { options: newOptions });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, {
      options: field.options.filter((_, i) => i !== optionIndex)
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      const templateData = {
        name,
        description,
        fields,
        is_active: true
      };

      if (template?.id) {
        await base44.entities.ReportTemplate.update(template.id, templateData);
      } else {
        await base44.entities.ReportTemplate.create(templateData);
      }
      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <FloatingInput
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FloatingInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Field Types */}
      <GlassCard className="p-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Add Field</p>
        <div className="flex flex-wrap gap-2">
          {fieldTypes.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addField(type.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <type.icon className="w-4 h-4" />
              <span className="text-sm">{type.label}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Fields List */}
      <div className="space-y-3">
        <Reorder.Group values={fields} onReorder={setFields} className="space-y-3">
          {fields.map((field, index) => (
            <Reorder.Item key={field.id} value={field}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          placeholder="Field Label"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">Required</span>
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(index, { required: checked })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {fieldTypes.find(t => t.id === field.type)?.icon && (
                          React.createElement(fieldTypes.find(t => t.id === field.type).icon, { className: 'w-4 h-4' })
                        )}
                        <span>{fieldTypes.find(t => t.id === field.type)?.label}</span>
                      </div>

                      {field.type === 'dropdown' && (
                        <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-medium text-slate-500">Options</p>
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                className="flex-1 h-8 text-sm"
                              />
                              <button
                                onClick={() => removeOption(index, optIndex)}
                                className="p-1 text-slate-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(index)}
                            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            <Plus className="w-4 h-4" />
                            Add Option
                          </button>
                        </div>
                      )}

                      <Input
                        placeholder="Placeholder text (optional)"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <button
                      onClick={() => removeField(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {fields.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No fields added yet. Click a field type above to add.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <AnimatedButton variant="ghost" onClick={onCancel}>
          Cancel
        </AnimatedButton>
        <AnimatedButton onClick={handleSave} loading={saving} disabled={!name.trim()}>
          <Save className="w-5 h-5 mr-2" />
          Save Template
        </AnimatedButton>
      </div>
    </div>
  );
}