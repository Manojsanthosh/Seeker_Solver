import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postProblemSchema, PostProblemFormData } from '../../lib/schemas';
import { useProblemStore } from '../../store/problemStore';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import {
  Calendar,
  Send,
  Video,
  Phone,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { CATEGORIES } from '../../mocks/seedData';
import { useToast } from '../../components/ui/Toast';
import { UploadedFile, PreferredWindow, TimeWindow, SessionMode, SessionUrgency } from '../../types';
import { cn } from '../../lib/utils';

export interface PostProblemFormProps {
  onSuccess?: () => void;
}

export const PostProblemForm: React.FC<PostProblemFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const { createProblem } = useProblemStore();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  // State for interactive fields
  const [budgetType, setBudgetType] = useState<'fixed' | 'range'>('fixed');
  const [selectedMode, setSelectedMode] = useState<SessionMode>('video');
  const [duration, setDuration] = useState<number>(45);
  const [urgency, setUrgency] = useState<SessionUrgency>('this_week');

  // Prepopulate today's and tomorrow's date for quick availability picker
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [availabilityWindows, setAvailabilityWindows] = useState<PreferredWindow[]>([
    { date: todayStr, timeWindow: 'afternoon' },
    { date: tomorrowStr, timeWindow: 'morning' },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PostProblemFormData>({
    resolver: zodResolver(postProblemSchema),
    defaultValues: {
      title: '',
      category: 'Software & Tech',
      description: '',
      budgetType: 'fixed',
      budget: 1200,
      budgetMin: 800,
      budgetMax: 1500,
      preferredMode: 'video',
      estimatedDuration: 45,
      preferredAvailability: availabilityWindows,
      urgency: 'this_week',
      deadline: nextWeekStr,
      location: 'Remote (IST)',
    },
  });

  const addAvailabilityWindow = () => {
    const newEntry: PreferredWindow = {
      date: tomorrowStr,
      timeWindow: 'evening',
    };
    const updated = [...availabilityWindows, newEntry];
    setAvailabilityWindows(updated);
    setValue('preferredAvailability', updated);
  };

  const removeAvailabilityWindow = (index: number) => {
    if (availabilityWindows.length <= 1) return;
    const updated = availabilityWindows.filter((_, i) => i !== index);
    setAvailabilityWindows(updated);
    setValue('preferredAvailability', updated);
  };

  const updateWindow = (index: number, field: keyof PreferredWindow, val: any) => {
    const updated = [...availabilityWindows];
    updated[index] = { ...updated[index], [field]: val };
    setAvailabilityWindows(updated);
    setValue('preferredAvailability', updated);
  };

  const handleModeChange = (mode: SessionMode) => {
    setSelectedMode(mode);
    setValue('preferredMode', mode);
  };

  const handleDurationChange = (dur: number) => {
    setDuration(dur);
    setValue('estimatedDuration', dur as any);
  };

  const handleUrgencyChange = (urg: SessionUrgency) => {
    setUrgency(urg);
    setValue('urgency', urg);
  };

  const handleBudgetTypeChange = (type: 'fixed' | 'range') => {
    setBudgetType(type);
    setValue('budgetType', type);
  };

  const onSubmit = async (data: PostProblemFormData) => {
    setIsSubmitting(true);
    try {
      await createProblem(
        {
          ...data,
          preferredAvailability: availabilityWindows,
          preferredMode: selectedMode,
          estimatedDuration: duration as any,
          urgency,
          budgetType,
        },
        {
          id: user?.id || 'usr_demo',
          name: user?.name || 'Ananya Sharma',
          avatarUrl: user?.avatarUrl,
        }
      );
      success('Problem published in IST!', 'Solvers can now discover and offer appointment slots.');
      reset();
      setAttachments([]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toastError('Could not post problem', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
      {/* Title */}
      <Input
        label="Problem Title *"
        placeholder="e.g. Memory leak in WebSocket stream or Capacitor Android safe areas"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Category & Urgency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category *"
          options={CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
          error={errors.category?.message}
          {...register('category')}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Urgency / Timeline *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This week' },
              { id: 'flexible', label: 'Flexible' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleUrgencyChange(u.id as SessionUrgency)}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center',
                  urgency === u.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Detailed Description *
        </label>
        <textarea
          rows={4}
          placeholder="Describe the issue, context, error logs, and what you aim to achieve in this live session..."
          className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs font-medium text-rose-500">{errors.description.message}</p>
        )}
      </div>

      {/* Budget in INR: Fixed vs Range */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900">
            Budget for Session (in ₹) *
          </label>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleBudgetTypeChange('fixed')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                budgetType === 'fixed'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Fixed Amount
            </button>
            <button
              type="button"
              onClick={() => handleBudgetTypeChange('range')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                budgetType === 'range'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Budget Range
            </button>
          </div>
        </div>

        {budgetType === 'fixed' ? (
          <div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                ₹
              </span>
              <input
                type="number"
                placeholder="1200"
                min={300}
                step={50}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                {...register('budget')}
              />
            </div>
            {errors.budget && (
              <p className="text-xs font-medium text-rose-500 mt-1">{errors.budget.message}</p>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Solvers will use this as reference when offering appointment fees.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Min Budget (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="800"
                  min={300}
                  step={50}
                  className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  {...register('budgetMin')}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Max Budget (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="1500"
                  min={300}
                  step={50}
                  className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  {...register('budgetMax')}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferred Session Mode & Estimated Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Preferred Session Mode *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'video', label: 'Video Call', icon: Video },
              { id: 'audio', label: 'Audio Call', icon: Phone },
              { id: 'chat', label: 'Chat Only', icon: MessageSquare },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id as SessionMode)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-[58px]',
                    selectedMode === m.id
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-700 ring-2 ring-indigo-600/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Estimated Duration (minutes) *
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleDurationChange(mins)}
                className={cn(
                  'py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center',
                  duration === mins
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Recommended for standard technical debugging: 45 minutes
          </p>
        </div>
      </div>

      {/* Preferred Availability Windows (Dates + Windows) */}
      <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Preferred Availability (IST Windows) *
            </label>
            <span className="text-[11px] text-slate-500">
              Pick dates and time windows that fit your schedule
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAvailabilityWindow}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs bg-white"
          >
            Add Date
          </Button>
        </div>

        <div className="space-y-2.5">
          {availabilityWindows.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
            >
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => updateWindow(idx, 'date', e.target.value)}
                  className="text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Time window selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'morning', label: 'Morning (9-12)' },
                  { id: 'afternoon', label: 'Afternoon (12-5)' },
                  { id: 'evening', label: 'Evening (5-9)' },
                  { id: 'custom', label: 'Custom' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => updateWindow(idx, 'timeWindow', w.id as TimeWindow)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all',
                      item.timeWindow === w.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {w.label}
                  </button>
                ))}

                {availabilityWindows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAvailabilityWindow(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                    title="Remove window"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Target Resolution Deadline *"
          type="date"
          leftIcon={<Calendar className="w-4 h-4 text-indigo-500" />}
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        <Input
          label="Location Preference"
          placeholder="Remote (IST)"
          defaultValue="Remote (IST)"
          {...register('location')}
        />
      </div>

      {/* File Upload */}
      <FileUpload
        label="Attach Logs, Tracebacks, Specs or Code (Optional)"
        files={attachments}
        onChange={setAttachments}
        helperText="Upload error screenshots, architecture diagrams, or code snippets"
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full justify-center shadow-elevated"
          rightIcon={<Send className="w-4 h-4" />}
        >
          Post Problem for Appointment Offers
        </Button>
      </div>
    </form>
  );
};
