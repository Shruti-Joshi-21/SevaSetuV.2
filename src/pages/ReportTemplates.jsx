import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Eye,
  Copy
} from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import TemplateBuilder from '@/components/reports/TemplateBuilder';
import { Input } from '@/components/ui/input';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

export default function ReportTemplates() {
  const [search, setSearch] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReportTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['reportTemplates']),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template) => {
      const { id, created_date, updated_date, created_by, ...data } = template;
      return base44.entities.ReportTemplate.create({
        ...data,
        name: `${data.name} (Copy)`,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['reportTemplates']),
  });

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (template) => {
    setEditTemplate(template);
    setShowBuilder(true);
  };

  const handleBuilderSuccess = () => {
    queryClient.invalidateQueries(['reportTemplates']);
    setShowBuilder(false);
    setEditTemplate(null);
  };

  if (showBuilder) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <button
              onClick={() => { setShowBuilder(false); setEditTemplate(null); }}
              className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center gap-1"
            >
              ← Back to Templates
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {editTemplate ? 'Edit Template' : 'Create Template'}
            </h1>
          </div>
          
          <TemplateBuilder
            template={editTemplate}
            onSave={handleBuilderSuccess}
            onCancel={() => { setShowBuilder(false); setEditTemplate(null); }}
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Report Templates
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage field report templates
            </p>
          </div>
          
          <AnimatedButton onClick={() => { setEditTemplate(null); setShowBuilder(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Create Template
          </AnimatedButton>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.is_active 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  
                  {template.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span>{template.fields?.length || 0} fields</span>
                    {template.created_date && (
                      <span>{format(parseISO(template.created_date), 'MMM d, yyyy')}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateMutation.mutate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </AnimatedButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-slate-500 mb-4">
              {search 
                ? 'Try adjusting your search'
                : 'Create your first report template to get started'}
            </p>
            <AnimatedButton onClick={() => setShowBuilder(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create Template
            </AnimatedButton>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}