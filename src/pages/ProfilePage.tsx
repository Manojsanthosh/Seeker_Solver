import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  ShieldCheck,
  Star,
  Linkedin,
  Instagram,
  FileText,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuthStore();
  const navigate = useNavigate();

  const isSolver = role === 'solver';
  const solver = user?.solverDetails;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={
            user?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`
          }
          alt={user?.name}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-md"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                  {user?.name || 'User Account'}
                </h1>
                {isSolver && solver?.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5 uppercase tracking-wider">
                {isSolver ? 'Qualified Solver' : 'Problem Seeker'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/settings')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="self-center sm:self-auto"
            >
              Edit Profile
            </Button>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
            {user?.bio ||
              'Member of the SolveBridge network resolving technical and operational challenges.'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user?.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {user?.phone}
            </span>
            {user?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user?.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Solver-Specific Profile Sections */}
      {isSolver && solver && (
        <div className="space-y-6">
          {/* Qualifications & Education */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Academic Credentials
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {solver.highestQualification} in {solver.fieldOfStudy}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {solver.institution} • Graduated {solver.completionYear}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 self-start sm:self-auto">
                {solver.experienceYears} Years Exp
              </span>
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Verified Skills & Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {solver.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {solver.certifications && solver.certifications.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Certifications & Badges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {solver.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left"
                  >
                    <h5 className="text-xs font-bold text-slate-900">{cert.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {cert.issuer} • Issued {cert.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Profiles - Shown ONLY if provided */}
          {(solver.linkedIn || solver.instagram) && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Connected Profiles
              </h3>
              <div className="flex flex-wrap gap-3">
                {solver.linkedIn && (
                  <a
                    href={
                      solver.linkedIn.startsWith('http')
                        ? solver.linkedIn
                        : `https://${solver.linkedIn}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 font-semibold text-xs transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn ({solver.linkedIn.split('/').pop()})</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                  </a>
                )}
                {solver.instagram && (
                  <a
                    href={`https://instagram.com/${solver.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 font-semibold text-xs transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram ({solver.instagram})</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seeker Specific Stats Summary */}
      {!isSolver && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Seeker Platform Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-slate-500 block">Total Spent</span>
              <span className="text-xl font-bold text-indigo-700 mt-1 block">
                {formatINR(user?.seekerDetails?.totalSpent || 18500)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Posted Problems</span>
              <span className="text-xl font-bold text-slate-800 mt-1 block">
                {user?.seekerDetails?.postedProblemsCount || 6}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-slate-500 block">Resolved Problems</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                {user?.seekerDetails?.resolvedCount || 4}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
