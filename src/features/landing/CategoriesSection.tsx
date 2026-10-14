import React from 'react';
import { CATEGORIES } from '../../mocks/seedData';
import {
  Code2,
  Palette,
  BrainCircuit,
  ShieldCheck,
  Cpu,
  Scale,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Palette,
  BrainCircuit,
  ShieldCheck,
  Cpu,
  Scale,
};

export const CategoriesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Specialized Fields
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Problem Categories
            </h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl">
              Explore challenges where verified solvers are actively delivering solutions right now.
            </p>
          </div>
          <Link
            to="/register"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Explore all categories <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || Code2;
            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-soft hover:border-indigo-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {cat.problemCount} problems
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
