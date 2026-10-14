import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Problem, Slot, SessionMode, User } from '../../types';
import { formatINR, formatISTDate } from '../../lib/utils';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Sparkles,
  Check,
  X,
  Info,
  Send,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useProblemStore } from '../../store/problemStore';
import { useToast } from '../ui/Toast';

export interface OfferAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  solver: User;
  onSuccess?: () => void;
}

export const OfferAppointmentModal: React.FC<OfferAppointmentModalProps> = ({
  isOpen,
  onClose,
  problem,
  solver,
  onSuccess,
}) => {
  const { createOffer, solverAvailability } = useProblemStore();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values based on problem preferences
  const [selectedDate, setSelectedDate] = useState<string>(
    problem.preferredAvailability?.[0]?.date ||
      new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [mode, setMode] = useState<SessionMode>(problem.preferredMode || 'video');
  const [duration, setDuration] = useState<number>(problem.estimatedDuration || 45);
  const [sessionFee, setSessionFee] = useState<number>(problem.budget || 1000);
  const [note, setNote] = useState<string>('');

  // 30-min standard slots grid from 09:00 AM to 08:30 PM
  const timeGrid = [
    { start: '09:00 AM', end: '09:30 AM', window: 'morning', hour24: 9 },
    { start: '09:30 AM', end: '10:00 AM', window: 'morning', hour24: 9.5 },
    { start: '10:00 AM', end: '10:30 AM', window: 'morning', hour24: 10 },
    { start: '10:30 AM', end: '11:00 AM', window: 'morning', hour24: 10.5 },
    { start: '11:00 AM', end: '11:30 AM', window: 'morning', hour24: 11 },
    { start: '11:30 AM', end: '12:00 PM', window: 'morning', hour24: 11.5 },
    { start: '12:00 PM', end: '12:30 PM', window: 'afternoon', hour24: 12 },
    { start: '02:00 PM', end: '02:30 PM', window: 'afternoon', hour24: 14 },
    { start: '02:30 PM', end: '03:00 PM', window: 'afternoon', hour24: 14.5 },
    { start: '03:00 PM', end: '03:30 PM', window: 'afternoon', hour24: 15 },
    { start: '03:30 PM', end: '04:00 PM', window: 'afternoon', hour24: 15.5 },
    { start: '04:00 PM', end: '04:30 PM', window: 'afternoon', hour24: 16 },
    { start: '04:30 PM', end: '05:00 PM', window: 'afternoon', hour24: 16.5 },
    { start: '05:00 PM', end: '05:30 PM', window: 'evening', hour24: 17 },
    { start: '05:30 PM', end: '06:00 PM', window: 'evening', hour24: 17.5 },
    { start: '06:00 PM', end: '06:30 PM', window: 'evening', hour24: 18 },
    { start: '06:30 PM', end: '07:00 PM', window: 'evening', hour24: 18.5 },
    { start: '07:00 PM', end: '07:30 PM', window: 'evening', hour24: 19 },
    { start: '07:30 PM', end: '08:00 PM', window: 'evening', hour24: 19.5 },
  ];

  // Helper to check if a slot overlaps with seeker's preferred availability
  const checkIsBestMatch = (date: string, windowType: string): boolean => {
    if (!problem.preferredAvailability || problem.preferredAvailability.length === 0) {
      return false;
    }
    return problem.preferredAvailability.some(
      (pa) => pa.date === date && (pa.timeWindow === windowType || pa.timeWindow === 'custom')
    );
  };

  const handleToggleSlot = (timeSlot: (typeof timeGrid)[0]) => {
    const isMatch = checkIsBestMatch(selectedDate, timeSlot.window);
    const existingIndex = selectedSlots.findIndex(
      (s) => s.date === selectedDate && s.startTime === timeSlot.start
    );

    if (existingIndex !== -1) {
      setSelectedSlots(selectedSlots.filter((_, i) => i !== existingIndex));
    } else {
      if (selectedSlots.length >= 5) {
        toastError('Maximum slots reached', 'You can offer up to 5 appointment slots.');
        return;
      }
      const newSlot: Slot = {
        id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        date: selectedDate,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        isBestMatch: isMatch,
      };
      setSelectedSlots([...selectedSlots, newSlot]);
    }
  };

  const removeSlot = (slotId: string) => {
    setSelectedSlots(selectedSlots.filter((s) => s.id !== slotId));
  };

  // Live price calculation
  const validFee = Math.max(0, Number(sessionFee) || 0);
  const platformFee = Math.round(validFee * 0.1);
  const gst = Math.round(platformFee * 0.18);
  const totalPayable = validFee + platformFee + gst;

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      toastError('No slots selected', 'Please select at least one appointment slot.');
      return;
    }
    if (validFee < 300) {
      toastError('Invalid fee', 'Minimum session fee is ₹300.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createOffer(
        problem,
        {
          slots: selectedSlots,
          mode,
          durationMinutes: duration,
          sessionFee: validFee,
          note: note.trim(),
        },
        solver
      );
      success(
        'Appointment Offer Sent!',
        `Offered ${selectedSlots.length} slot(s) to ${problem.seekerName}.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Could not send offer', err?.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Offer Appointment"
      description={`Provide flexible meeting slots for "${problem.title}"`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full pt-2">
          <div className="text-left">
            <span className="text-[11px] text-slate-500 block">Total Seeker Price:</span>
            <span className="text-lg font-black text-indigo-700 font-heading">
              {formatINR(totalPayable)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              rightIcon={<Send className="w-3.5 h-3.5" />}
              className="shadow-elevated"
            >
              Send Offer ({selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-left text-sm max-h-[75vh] overflow-y-auto pr-1">
        {/* Seeker Preferences Banner */}
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" /> Seeker's Stated Preferences
            </span>
            <span className="text-xs font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
              Budget: {formatINR(problem.budget)}
              {problem.budgetType === 'range' &&
                problem.budgetMin &&
                problem.budgetMax &&
                ` (${formatINR(problem.budgetMin)} - ${formatINR(problem.budgetMax)})`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-500">Mode: </span>
              <span className="font-semibold capitalize">{problem.preferredMode} call</span>
            </div>
            <div>
              <span className="text-slate-500">Duration: </span>
              <span className="font-semibold">{problem.estimatedDuration} mins</span>
            </div>
            <div>
              <span className="text-slate-500">Preferred Windows: </span>
              <span className="font-semibold">
                {problem.preferredAvailability
                  ?.map((w) => `${formatISTDate(w.date)} (${w.timeWindow})`)
                  .join(', ') || 'Flexible'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Date Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            1. Select Date for Available Slots
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            {/* Quick date chips */}
            {[
              {
                label: 'Today',
                date: new Date().toISOString().split('T')[0],
              },
              {
                label: 'Tomorrow',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              },
            ].map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => setSelectedDate(q.date)}
                className={cn(
                  'px-3 py-2 text-xs font-semibold rounded-xl border transition-all min-h-[44px]',
                  selectedDate === q.date
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 30-min Time Slot Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Select 30-min Time Slots (Up to 5)
            </label>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Green = Best Match
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {timeGrid.map((slot) => {
              const isSelected = selectedSlots.some(
                (s) => s.date === selectedDate && s.startTime === slot.start
              );
              const isBestMatch = checkIsBestMatch(selectedDate, slot.window);

              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => handleToggleSlot(slot)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[58px]',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-600/30'
                      : isBestMatch
                      ? 'bg-emerald-50/70 border-emerald-400/80 text-emerald-950 hover:bg-emerald-100/70'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isSelected ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {slot.start}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={cn(
                        'text-[10px] capitalize',
                        isSelected ? 'text-indigo-200' : 'text-slate-400'
                      )}
                    >
                      {slot.window}
                    </span>
                    {isBestMatch && !isSelected && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-600 text-white tracking-wider">
                        Best match
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected slots chips display */}
          {selectedSlots.length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Offered Slots ({selectedSlots.length}/5):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSlots.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200"
                  >
                    <Clock className="w-3 h-3 text-indigo-600" />
                    {formatISTDate(s.date)} • {s.startTime}
                    {s.isBestMatch && (
                      <span className="text-[9px] bg-emerald-600 text-white px-1 rounded-sm">
                        Match
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSlot(s.id)}
                      className="text-indigo-700 hover:text-rose-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Session Mode & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              3. Session Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5">
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
                    onClick={() => setMode(m.id as SessionMode)}
                    className={cn(
                      'p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all min-h-[50px]',
                      mode === m.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-bold border transition-all text-center',
                    duration === mins
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Session Fee & Live Price Breakdown */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Your Session Fee (in ₹)
              </label>
              <span className="text-xs text-indigo-600 font-semibold">
                Seeker Budget: {formatINR(problem.budget)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                value={sessionFee}
                min={300}
                step={50}
                onChange={(e) => setSessionFee(Number(e.target.value))}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 bg-white font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              You receive 90% ({formatINR(Math.round(validFee * 0.9))}) after session completion.
            </p>
          </div>

          {/* Live Price breakdown */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Session Fee:</span>
              <span className="font-semibold text-slate-800">{formatINR(validFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (10%):</span>
              <span className="font-semibold text-slate-800">+{formatINR(platformFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% on platform fee):</span>
              <span className="font-semibold text-slate-800">+{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-sm text-slate-900">
              <span>Total Payable by Seeker:</span>
              <span className="text-indigo-700 font-black">{formatINR(totalPayable)}</span>
            </div>
          </div>
        </div>

        {/* 5. Optional Note */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              5. Note for Seeker (Optional)
            </label>
            <span
              className={cn(
                'text-[11px]',
                note.length > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'
              )}
            >
              {note.length}/200
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Briefly state your technical plan for this live session..."
            className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>
      </div>
    </Modal>
  );
};
