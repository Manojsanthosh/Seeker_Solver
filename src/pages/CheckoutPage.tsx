import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { formatINR, formatISTDate, downloadICS, validateUPI } from '../lib/utils';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  CreditCard,
  Building2,
  Wallet,
  ArrowRight,
  Download,
  Lock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import { Offer, Slot, Session } from '../types';

export const CheckoutPage: React.FC = () => {
  const { offerId, slotId } = useParams<{ offerId: string; slotId: string }>();
  const { offers, bookSession, sessions } = useProblemStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');

  // Form states for methods
  const [upiId, setUpiId] = useState('ananya@okhdfcbank');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('420');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookedSession, setBookedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (offers.length > 0) {
      const foundOffer = offers.find((o) => o.id === offerId) || offers[0];
      setSelectedOffer(foundOffer);
      if (foundOffer) {
        const foundSlot = foundOffer.slots.find((s) => s.id === slotId) || foundOffer.slots[0];
        setSelectedSlot(foundSlot);
      }
    }
  }, [offers, offerId, slotId]);

  if (!selectedOffer || !selectedSlot) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading booking details...</p>
      </div>
    );
  }

  const handlePayAndConfirm = async () => {
    if (paymentMethod === 'upi' && upiApp === 'custom') {
      if (!validateUPI(upiId)) {
        toastError('Invalid UPI ID', 'Please enter a valid format like name@bank');
        return;
      }
    }

    setIsProcessing(true);

    // =========================================================================
    // TODO: Integrate Razorpay Checkout SDK
    // const options = {
    //   key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    //   amount: selectedOffer.totalPayable * 100, // in paise
    //   currency: 'INR',
    //   name: 'SolveBridge Session Escrow',
    //   description: `Session: ${selectedOffer.problemTitle}`,
    //   handler: function (response) { ... verify signature on backend ... }
    // };
    // const rzp = new (window as any).Razorpay(options);
    // rzp.open();
    // =========================================================================

    try {
      const session = await bookSession(
        selectedOffer,
        selectedSlot,
        user || {
          id: 'usr_seeker_001',
          name: 'Ananya Sharma',
          email: 'seeker@demo.com',
          phone: '+91 98765 43210',
          role: 'seeker',
          createdAt: new Date().toISOString(),
        },
        paymentMethod
      );

      setIsProcessing(false);
      setBookedSession(session);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }

      success('Payment Authorized & Locked in Escrow!', 'Your appointment slot is confirmed.');
    } catch (err: any) {
      setIsProcessing(false);
      toastError('Payment failed', err?.message || 'Please check your payment information.');
    }
  };

  const handleDownloadICS = () => {
    if (!selectedSlot) return;
    downloadICS({
      title: `SolveBridge: ${selectedOffer.problemTitle}`,
      description: `Live problem solving session with ${selectedOffer.solverName} via ${selectedOffer.mode} call. Escrow protected.`,
      startDateTime: `${selectedSlot.date}T${selectedSlot.startTime.replace(/ /g, '')}`,
      durationMinutes: selectedOffer.durationMinutes,
      location: 'https://solvebridge.in/app/sessions/room',
    });
    success('Calendar Added', 'SolveBridge-Session.ics downloaded.');
  };

  // SUCCESS CONFIRMATION SCREEN
  if (bookedSession) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Booking Confirmed & Escrow Secured
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-3">
          You are all set for your session!
        </h1>

        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Your payment of <strong className="text-slate-900">{formatINR(selectedOffer.totalPayable)}</strong> is safely held in escrow and will only be released to {selectedOffer.solverName} after you mark the problem resolved.
        </p>

        {/* Slot Summary Card */}
        <div className="my-6 p-5 bg-white rounded-3xl border border-slate-200/90 shadow-card text-left max-w-md mx-auto space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <img
              src={selectedOffer.solverAvatar}
              alt={selectedOffer.solverName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{selectedOffer.solverName}</h4>
              <p className="text-xs text-indigo-600 font-medium">Verified Specialist</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date (IST):
              </span>
              <span className="font-bold text-slate-900">{formatISTDate(selectedSlot.date)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Time Slot:
              </span>
              <span className="font-bold text-slate-900">
                {selectedSlot.startTime} - {selectedSlot.endTime} IST
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Video className="w-3.5 h-3.5 text-indigo-600" /> Mode:
              </span>
              <span className="font-bold text-slate-900 capitalize">{selectedOffer.mode} Call</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            size="md"
            onClick={handleDownloadICS}
            leftIcon={<Download className="w-4 h-4 text-indigo-600" />}
            className="w-full sm:w-auto"
          >
            Add to Calendar (.ics)
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/app/sessions/${bookedSession.id}/lobby`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-elevated"
          >
            Go to Session Lobby
          </Button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate('/app/sessions')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
          >
            View all my sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-left animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Confirm Appointment & Escrow Deposit
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review the selected appointment slot, price breakdown in ₹, and choose your payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Slot summary + Payment methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Slot Summary */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Selected Session Details
            </h3>

            <div className="flex items-start gap-4">
              <img
                src={selectedOffer.solverAvatar}
                alt={selectedOffer.solverName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">{selectedOffer.solverName}</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Solver
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{selectedOffer.problemTitle}</p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-700">
                  <span className="font-semibold text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatISTDate(selectedSlot.date)}
                  </span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {selectedSlot.startTime} - {selectedSlot.endTime} IST ({selectedOffer.durationMinutes}m)
                  </span>
                  <span className="capitalize font-semibold text-slate-800 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Video className="w-3.5 h-3.5 text-slate-500" />
                    {selectedOffer.mode} Call
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-card space-y-5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Select Payment Method
            </h3>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI', desc: 'GPay, PhonePe', icon: Sparkles },
                { id: 'card', label: 'Cards', desc: 'Debit / Credit', icon: CreditCard },
                { id: 'netbanking', label: 'Netbanking', desc: 'All Banks', icon: Building2 },
                { id: 'wallet', label: 'Wallet', desc: 'Paytm, etc.', icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={cn(
                      'p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-[70px]',
                      paymentMethod === m.id
                        ? 'bg-indigo-50/80 border-indigo-600 text-indigo-700 ring-2 ring-indigo-600/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold block">{m.label}</span>
                    <span className="text-[10px] text-slate-400 block hidden sm:block">
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Method Details Form */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Fast UPI App or Enter Virtual ID
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'gpay', label: 'Google Pay' },
                    { id: 'phonepe', label: 'PhonePe' },
                    { id: 'paytm', label: 'Paytm UPI' },
                    { id: 'custom', label: 'Enter ID' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id as any)}
                      className={cn(
                        'py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all',
                        upiApp === app.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>

                {upiApp === 'custom' ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. mobile@okhdfcbank or name@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    A payment request of <strong className="text-slate-900">{formatINR(selectedOffer.totalPayable)}</strong> will be sent to your {upiApp.toUpperCase()} app. Approve on your phone to lock funds in milestone escrow.
                  </p>
                )}
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 0000 0000 0000"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Bank
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={cn(
                        'py-2.5 px-2 text-xs font-bold rounded-xl border text-center transition-all',
                        selectedBank === bank
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Digital Wallet
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Paytm Wallet', 'Mobikwik', 'Amazon Pay'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={cn(
                        'py-2.5 px-2 text-xs font-bold rounded-xl border text-center transition-all',
                        selectedWallet === w
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Price Breakdown & Escrow Guarantee */}
        <div className="space-y-5">
          {/* Price Breakdown Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Order Summary (INR)
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 pb-3 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Session Fee ({selectedOffer.durationMinutes} mins):</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(selectedOffer.sessionFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span className="font-semibold text-slate-900">
                  +{formatINR(selectedOffer.platformFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% on platform fee):</span>
                <span className="font-semibold text-slate-900">
                  +{formatINR(selectedOffer.gst)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-1">
              <span>Total Payable:</span>
              <span className="text-xl text-indigo-700 font-heading">
                {formatINR(selectedOffer.totalPayable)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              onClick={handlePayAndConfirm}
              leftIcon={<Lock className="w-4 h-4" />}
              className="w-full justify-center shadow-elevated"
            >
              Pay {formatINR(selectedOffer.totalPayable)} in Escrow
            </Button>

            <p className="text-[11px] text-center text-slate-400">
              Instant refund if cancelled 6+ hours before start time.
            </p>
          </div>

          {/* Escrow Guarantee Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> SolveBridge Escrow Guarantee
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Your money is never sent directly to the solver upfront. It stays in a protected milestone escrow and is only released after you mark the session complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
