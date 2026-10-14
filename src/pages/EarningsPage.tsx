import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProblemStore } from '../store/problemStore';
import { EarningsChart } from '../features/solver/EarningsChart';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatINR, validateUPI, validateIFSC } from '../lib/utils';
import {
  ArrowUpRight,
  ShieldCheck,
  Download,
  CreditCard,
  Building2,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import { PaymentRecord } from '../types';

export const EarningsPage: React.FC = () => {
  const { role, user } = useAuthStore();
  const { seekerPayments, solverPayouts, withdrawEarnings } = useProblemStore();
  const { success, error: toastError } = useToast();

  const isSolver = role === 'solver';

  // Withdrawal Modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(15000);
  const [upiId, setUpiId] = useState('rajesh@okhdfcbank');
  const [beneficiaryName, setBeneficiaryName] = useState('Dr. Rajesh Raman');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('987654321098');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const availableBalance = isSolver ? 42500 : 3200;
  const pendingInEscrow = isSolver ? 3000 : 3200;
  const totalEarnedOrSpent = isSolver ? 184500 : 18500;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 500) {
      toastError('Minimum Amount', 'Minimum withdrawal amount is ₹500.');
      return;
    }
    if (withdrawAmount > availableBalance) {
      toastError('Insufficient Balance', `You can withdraw up to ${formatINR(availableBalance)}.`);
      return;
    }

    if (withdrawMethod === 'upi') {
      if (!validateUPI(upiId)) {
        toastError('Invalid UPI ID', 'Enter a valid UPI ID (e.g. name@bank)');
        return;
      }
    } else {
      if (!accountNumber || accountNumber !== confirmAccountNumber) {
        toastError('Account Mismatch', 'Bank account numbers must match.');
        return;
      }
      if (!validateIFSC(ifscCode)) {
        toastError('Invalid IFSC', 'Enter a valid 11-character IFSC code (e.g. HDFC0001234)');
        return;
      }
    }

    setIsSubmittingWithdraw(true);
    try {
      const destination = withdrawMethod === 'upi' ? upiId : `${accountNumber} (${ifscCode})`;
      await withdrawEarnings(withdrawAmount, withdrawMethod, destination);
      success(
        'Withdrawal Initiated',
        `${formatINR(withdrawAmount)} will be credited to your ${withdrawMethod.toUpperCase()} in 2-4 hours.`
      );
      setIsWithdrawModalOpen(false);
    } catch (err: any) {
      toastError('Withdrawal Failed', err?.message || 'Please check your bank details.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const handleDownloadInvoice = (item: PaymentRecord) => {
    const text = `
SOLVEBRIDGE ESCROW INVOICE / RECEIPT
------------------------------------------------------
Invoice ID: ${item.invoiceId || 'INV-2026-X'}
Date: ${item.date}
Title: ${item.title}
Transaction Amount: ${formatINR(item.amount)}
Platform Charges: ${formatINR(item.fee)}
Net Amount: ${formatINR(item.net)}
Escrow Status: ${item.status}
Currency: INR (Indian Rupees ₹)
------------------------------------------------------
SolveBridge Technologies India Pvt. Ltd.
GSTIN: 29AABCS1429B1Z8
Bangalore, Karnataka, India
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${item.invoiceId || 'Invoice'}.txt`;
    link.click();
    success('Invoice Downloaded', 'Invoice statement saved.');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            {isSolver ? 'Solver Financials' : 'Seeker Escrow Account'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            {isSolver ? 'Earnings & Instant Payouts' : 'Payments & Escrow Transactions'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSolver
              ? 'Track completed session fees in ₹, available balance, and withdraw directly to Indian bank or UPI.'
              : 'Review your milestone escrow deposits in ₹, active session holds, and released developer payouts.'}
          </p>
        </div>

        {isSolver ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsWithdrawModalOpen(true)}
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
            className="shadow-elevated self-start sm:self-auto font-bold"
          >
            Withdraw to Bank / UPI
          </Button>
        ) : (
          <Button
            variant="outline"
            size="md"
            onClick={() => success('Payment Methods', 'UPI & Cards active.')}
            leftIcon={<CreditCard className="w-4 h-4" />}
            className="self-start sm:self-auto text-xs"
          >
            Payment Methods
          </Button>
        )}
      </div>

      {/* 3 Stats Cards in INR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={isSolver ? 'Available for Withdrawal' : 'Funds in Milestone Escrow'}
          value={formatINR(availableBalance)}
          colorScheme="indigo"
          icon={<span className="font-bold text-base">₹</span>}
        />
        <StatCard
          title={isSolver ? 'Pending in Escrow' : 'Total Lifetime Spent'}
          value={formatINR(isSolver ? pendingInEscrow : totalEarnedOrSpent)}
          description={isSolver ? 'Releases upon session complete' : 'All sessions combined'}
          colorScheme="amber"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <StatCard
          title={isSolver ? 'Total Lifetime Earned' : 'Completed Sessions'}
          value={isSolver ? formatINR(totalEarnedOrSpent) : '4 Sessions'}
          change={isSolver ? '+18% growth' : '100% satisfied'}
          trend="up"
          colorScheme="emerald"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Recharts Area Chart in INR for Solvers */}
      {isSolver && <EarningsChart />}

      {/* Transactions / Payouts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isSolver ? 'Payout & Settlement History' : 'Milestone Escrow Transactions'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All amounts in Indian Rupees (INR ₹)
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => success('Export', 'Account statement exported.')}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs text-slate-600"
          >
            Export All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Date (IST)</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                {isSolver && <th className="py-3 px-4">Platform Fee (10%)</th>}
                <th className="py-3 px-4">{isSolver ? 'Net Payout' : 'Escrow Status'}</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(isSolver ? solverPayouts : seekerPayments).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {tx.title}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{formatINR(tx.amount)}</td>
                  {isSolver && (
                    <td className="py-3.5 px-4 text-slate-400">-{formatINR(tx.fee)}</td>
                  )}
                  <td className="py-3.5 px-4">
                    {isSolver ? (
                      <span className="font-bold text-emerald-600">+{formatINR(tx.net)}</span>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px]',
                          tx.status === 'Released'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'In Escrow'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {tx.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(tx)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50"
                      title="Download receipt"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAW TO BANK / UPI MODAL (SOLVER) */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Earnings to Bank / UPI"
        description={`Available Balance: ${formatINR(availableBalance)}`}
        maxWidth="md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-left text-xs">
          {/* Method Selector */}
          <div>
            <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">
              Select Payout Method:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWithdrawMethod('upi')}
                className={cn(
                  'p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2',
                  withdrawMethod === 'upi'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span>Instant UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setWithdrawMethod('bank')}
                className={cn(
                  'p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2',
                  withdrawMethod === 'bank'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <Building2 className="w-4 h-4" />
                <span>Bank Account (NEFT/IMPS)</span>
              </button>
            </div>
          </div>

          {/* Amount to withdraw */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-600 font-bold uppercase tracking-wider">
                Withdrawal Amount (in ₹):
              </label>
              <button
                type="button"
                onClick={() => setWithdrawAmount(availableBalance)}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Max ({formatINR(availableBalance)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min={500}
                max={availableBalance}
                step={100}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          {/* UPI Fields */}
          {withdrawMethod === 'upi' && (
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                Virtual Payment Address (UPI ID) *:
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank (e.g. rajesh@okhdfcbank)"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supported handles: @okhdfcbank, @okicici, @paytm, @ybl, @upi
              </p>
            </div>
          )}

          {/* Bank Fields */}
          {withdrawMethod === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                  Beneficiary Account Name:
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                    Account Number:
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="9-18 digits"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                    Confirm Account:
                  </label>
                  <input
                    type="password"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                    placeholder="Re-enter account"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                  11-Character IFSC Code:
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  maxLength={11}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono uppercase text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmittingWithdraw}
              className="w-full justify-center shadow-elevated font-bold"
            >
              Withdraw {formatINR(withdrawAmount)} Now
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
