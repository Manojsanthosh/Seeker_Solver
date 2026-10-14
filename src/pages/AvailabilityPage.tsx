import React, { useState } from 'react';
import { useProblemStore } from '../store/problemStore';
import { Button } from '../components/ui/Button';
import { formatINR, formatISTDate } from '../lib/utils';
import {
  CalendarDays,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SolverAvailability, WeeklyDaySchedule, SessionMode } from '../types';
import { useToast } from '../components/ui/Toast';

export const AvailabilityPage: React.FC = () => {
  const { solverAvailability, updateAvailability } = useProblemStore();
  const { success } = useToast();

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyDaySchedule[]>(
    solverAvailability.weeklySchedule
  );
  const [blockedDates, setBlockedDates] = useState<string[]>(
    solverAvailability.blockedDates || ['2026-10-24', '2026-10-25']
  );
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(
    solverAvailability.defaultFeePer30Min || 800
  );
  const [preferredModes, setPreferredModes] = useState<SessionMode[]>(
    solverAvailability.preferredModes || ['video', 'audio', 'chat']
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (dayIndex: number) => {
    const updated = [...weeklySchedule];
    updated[dayIndex].enabled = !updated[dayIndex].enabled;
    setWeeklySchedule(updated);
  };

  const addSlotToDay = (dayIndex: number) => {
    const updated = [...weeklySchedule];
    updated[dayIndex].slots.push({ start: '14:00', end: '18:00' });
    setWeeklySchedule(updated);
  };

  const removeSlotFromDay = (dayIndex: number, slotIndex: number) => {
    const updated = [...weeklySchedule];
    updated[dayIndex].slots = updated[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setWeeklySchedule(updated);
  };

  const updateDaySlot = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    val: string
  ) => {
    const updated = [...weeklySchedule];
    updated[dayIndex].slots[slotIndex][field] = val;
    setWeeklySchedule(updated);
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    if (blockedDates.includes(newBlockedDate)) return;
    setBlockedDates([...blockedDates, newBlockedDate]);
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    setBlockedDates(blockedDates.filter((d) => d !== dateStr));
  };

  const toggleMode = (mode: SessionMode) => {
    if (preferredModes.includes(mode)) {
      if (preferredModes.length <= 1) return;
      setPreferredModes(preferredModes.filter((m) => m !== mode));
    } else {
      setPreferredModes([...preferredModes, mode]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData: SolverAvailability = {
      weeklySchedule,
      blockedDates,
      defaultFeePer30Min: defaultFee,
      preferredModes,
    };
    await updateAvailability(updatedData);
    setIsSaving(false);
    success('Availability Saved!', 'Your weekly schedule & matching badges are updated.');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Solver Availability & Rates
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Weekly Recurring Schedule (IST)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your active appointment windows, default fee per 30 mins in ₹, and blocked holiday dates.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          isLoading={isSaving}
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4" />}
          className="shadow-elevated self-start sm:self-auto"
        >
          Save Availability
        </Button>
      </div>

      {/* Feature Explainer Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <strong>Smart Availability Matching:</strong> When seekers post problems with preferred date and time windows that overlap with this schedule, you will see a green <span className="font-bold underline text-emerald-700">"Matches your availability"</span> badge in the Browse Challenges directory!
        </div>
      </div>

      {/* Pricing & Modes Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-card space-y-5">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Default Pricing & Preferred Modes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Default Fee per 30 min in INR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Default Fee per 30 Minutes (in ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min={300}
                step={50}
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used as the pre-filled price when offering appointment slots.
            </p>
          </div>

          {/* Preferred Modes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Accepted Session Modes
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'video', label: 'Video Call', icon: Video },
                { id: 'audio', label: 'Audio Call', icon: Phone },
                { id: 'chat', label: 'Chat Only', icon: MessageSquare },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = preferredModes.includes(m.id as SessionMode);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMode(m.id as SessionMode)}
                    className={cn(
                      'p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all min-h-[58px]',
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Days Editor */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Weekly Recurring Hours (IST)
        </h3>

        <div className="divide-y divide-slate-100">
          {weeklySchedule.map((dayItem, dIdx) => (
            <div
              key={dayItem.day}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Day checkbox toggle */}
              <div className="flex items-center space-x-3 w-40">
                <input
                  type="checkbox"
                  id={`day-${dayItem.day}`}
                  checked={dayItem.enabled}
                  onChange={() => toggleDay(dIdx)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`day-${dayItem.day}`}
                  className={cn(
                    'text-sm font-bold cursor-pointer',
                    dayItem.enabled ? 'text-slate-900' : 'text-slate-400 line-through'
                  )}
                >
                  {dayItem.day}
                </label>
              </div>

              {/* Time Slots List */}
              <div className="flex-1 space-y-2">
                {dayItem.enabled ? (
                  dayItem.slots.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No hours set for {dayItem.day}. Click "+ Add Time Range".
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {dayItem.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateDaySlot(dIdx, sIdx, 'start', e.target.value)
                            }
                            className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateDaySlot(dIdx, sIdx, 'end', e.target.value)
                            }
                            className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlotFromDay(dIdx, sIdx)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                            title="Remove slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Unavailable</span>
                )}
              </div>

              {/* Add slot button */}
              {dayItem.enabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addSlotToDay(dIdx)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs text-indigo-600 hover:text-indigo-800 self-start md:self-auto"
                >
                  Add Range
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Date-specific Blocked Dates Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Date-Specific Overrides / Blocked Dates
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Block national holidays, festivals, or personal leave dates where you are unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="date"
            value={newBlockedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="w-full sm:w-64 h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddBlockedDate}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs w-full sm:w-auto"
          >
            Block Date
          </Button>
        </div>

        {/* Blocked Date Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {blockedDates.map((dateStr) => (
            <span
              key={dateStr}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
            >
              <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
              {formatISTDate(dateStr)} (Blocked)
              <button
                type="button"
                onClick={() => handleRemoveBlockedDate(dateStr)}
                className="hover:text-rose-900 ml-1"
                title="Unblock date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
