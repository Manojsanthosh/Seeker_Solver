import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatINR, formatISTDate } from '../lib/utils';
import {
  Send,
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Offer } from '../types';

export const MyOffersPage: React.FC = () => {
  const { offers, sessions } = useProblemStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'accepted' | 'declined'>('all');
  const [inspectOffer, setInspectOffer] = useState<Offer | null>(null);

  // Filter offers sent by current solver (or all for demo)
  const filteredOffers = offers.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const getStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Booked by Seeker
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock3 className="w-3.5 h-3.5 text-sky-600" /> Offer Pending Review
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Appointment Offers
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            My Sent Appointment Offers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track status of appointment slots offered to seekers and upcoming session bookings.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/app/solver/browse')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shadow-elevated self-start sm:self-auto"
        >
          Browse Challenges
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Offers', count: offers.length },
          {
            id: 'sent',
            label: 'Pending Seeker Review',
            count: offers.filter((o) => o.status === 'sent').length,
          },
          {
            id: 'accepted',
            label: 'Booked / Confirmed',
            count: offers.filter((o) => o.status === 'accepted').length,
          },
          {
            id: 'declined',
            label: 'Declined',
            count: offers.filter((o) => o.status === 'declined').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-2 min-h-[44px]',
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px]',
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      {filteredOffers.length === 0 ? (
        <EmptyState
          title="No appointment offers found"
          description="Browse open challenges and propose appointment slots that align with your availability."
          actionLabel="Browse Challenges"
          onAction={() => navigate('/app/solver/browse')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOffers.map((offer) => {
            const correspondingSession = sessions.find(
              (s) => s.problemId === offer.problemId
            );

            return (
              <div
                key={offer.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-soft transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getStatusBadge(offer.status)}
                    <span className="text-base font-extrabold text-slate-900 font-heading">
                      {formatINR(offer.sessionFee)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                    {offer.problemTitle}
                  </h3>

                  {offer.note && (
                    <p className="text-xs text-slate-500 italic mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{offer.note}"
                    </p>
                  )}

                  {/* Offered Slots Strip */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Offered Slots ({offer.slots.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {offer.slots.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatISTDate(s.date)} • {s.startTime}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Net Payout: {formatINR(Math.round(offer.sessionFee * 0.9))}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectOffer(offer)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Inspect
                    </Button>

                    {offer.status === 'accepted' && correspondingSession && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          navigate(`/app/sessions/${correspondingSession.id}/lobby`)
                        }
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Go to Session
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INSPECT OFFER MODAL */}
      {inspectOffer && (
        <Modal
          isOpen={!!inspectOffer}
          onClose={() => setInspectOffer(null)}
          title={`Offer Details: ${inspectOffer.problemTitle}`}
          description={`Sent ${formatISTDate(inspectOffer.createdAt)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-left text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Session Fee:</span>
                <span className="font-bold text-slate-900">{formatINR(inspectOffer.sessionFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Fee (10%):</span>
                <span className="font-bold text-slate-900">+{formatINR(inspectOffer.platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18% on platform fee):</span>
                <span className="font-bold text-slate-900">+{formatINR(inspectOffer.gst)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold">
                <span>Total Payable by Seeker:</span>
                <span className="text-indigo-700">{formatINR(inspectOffer.totalPayable)}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 uppercase tracking-wider mb-2">
                Offered Slots:
              </h5>
              <div className="space-y-2">
                {inspectOffer.slots.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-900">
                      {formatISTDate(s.date)} • {s.startTime} - {s.endTime} IST
                    </span>
                    {s.isBestMatch && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Best match
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
