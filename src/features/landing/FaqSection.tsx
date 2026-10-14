import React, { useState } from 'react';
import { FAQS } from '../../mocks/seedData';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Got Questions?
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Everything you need to know about the platform, escrow, and solver vetting.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border transition-all duration-200 overflow-hidden text-left',
                  isOpen
                    ? 'border-indigo-300 bg-indigo-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-slate-900 min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <div
                    className={cn(
                      'p-1.5 rounded-full text-slate-400 transition-transform duration-200',
                      isOpen ? 'rotate-180 text-indigo-600 bg-indigo-100' : 'bg-slate-100'
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-indigo-100/60 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
