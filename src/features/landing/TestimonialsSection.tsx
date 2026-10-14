import React from 'react';
import { TESTIMONIALS } from '../../mocks/seedData';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Real Stories
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by Seekers & Solvers
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Read how SolveBridge transforms technical roadblocks into career breakthroughs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft flex flex-col justify-between text-left relative"
            >
              <div>
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center space-x-3">
                <img
                  src={t.avatarUrl}
                  alt={t.authorName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.authorName}</h4>
                  <p className="text-xs text-indigo-600 font-semibold">{t.authorRole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
