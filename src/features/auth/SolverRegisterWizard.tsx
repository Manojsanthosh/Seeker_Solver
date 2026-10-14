import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  solverStep1Schema,
  solverStep2Schema,
  solverStep3Schema,
  SolverStep1Data,
  SolverStep2Data,
  SolverStep3Data,
} from '../../lib/schemas';
import { useAuthStore } from '../../store/authStore';
import { Stepper, StepItem } from '../../components/ui/Stepper';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Select } from '../../components/ui/Select';
import { TagInput } from '../../components/ui/TagInput';
import { FileUpload } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/Button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Plus,
  Trash2,
  Linkedin,
  Instagram,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { UploadedFile } from '../../types';
import { generateId } from '../../lib/utils';

export interface SolverRegisterWizardProps {
  onSuccess: () => void;
  onBackToRoles: () => void;
}

const STEPS: StepItem[] = [
  { id: 1, title: 'Basic Details', description: 'Personal information' },
  { id: 2, title: 'Qualifications', description: 'Academic & certified skills' },
  { id: 3, title: 'Social & Review', description: 'Optional profiles & submission' },
];

export const SolverRegisterWizard: React.FC<SolverRegisterWizardProps> = ({
  onSuccess,
  onBackToRoles,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { registerSolver, isLoading } = useAuthStore();
  const { success, error: toastError } = useToast();

  // Wizard state preservation
  const [step1Data, setStep1Data] = useState<SolverStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<SolverStep2Data | null>(null);

  // =====================
  // Step 1 Form
  // =====================
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    watch: watch1,
    formState: { errors: errors1 },
  } = useForm<SolverStep1Data>({
    resolver: zodResolver(solverStep1Schema),
    defaultValues: step1Data || {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: '',
      bio: '',
    },
  });

  const bioValue = watch1('bio') || '';

  const onStep1Submit = (data: SolverStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  // =====================
  // Step 2 Form
  // =====================
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    watch: watch2,
    control: control2,
    formState: { errors: errors2 },
  } = useForm<SolverStep2Data>({
    resolver: zodResolver(solverStep2Schema),
    defaultValues: step2Data || {
      highestQualification: "Bachelor's",
      fieldOfStudy: '',
      institution: '',
      completionYear: '',
      experienceYears: 3,
      skills: ['TypeScript', 'React'],
      certifications: [],
      documents: [],
    },
  });

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: control2,
    name: 'certifications',
  });

  const watchedSkills = watch2('skills') || [];
  const watchedDocs = watch2('documents') || [];

  const onStep2Submit = (data: SolverStep2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  // =====================
  // Step 3 Form
  // =====================
  const {
    register: register3,
    handleSubmit: handleSubmit3,
    setValue: setValue3,
    formState: { errors: errors3 },
  } = useForm<SolverStep3Data>({
    resolver: zodResolver(solverStep3Schema),
    defaultValues: {
      linkedIn: '',
      instagram: '',
      acceptTerms: false,
    },
  });

  const onFinalSubmit = async (step3: SolverStep3Data) => {
    if (!step1Data || !step2Data) {
      toastError('Error', 'Please complete previous steps first.');
      setCurrentStep(1);
      return;
    }

    try {
      await registerSolver(step1Data, step2Data, step3);
      success('Registration submitted!', 'Your solver profile is now under review.');
      onSuccess();
    } catch (err: any) {
      toastError('Submission failed', err.message || 'Unable to register solver.');
    }
  };

  const handleSkipSocial = () => {
    setValue3('linkedIn', '');
    setValue3('instagram', '');
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-left space-y-6">
      {/* Back button */}
      <div>
        {currentStep === 1 ? (
          <button
            type="button"
            onClick={onBackToRoles}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center"
          >
            ← Change Account Role
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center"
          >
            ← Back to Step {currentStep - 1}
          </button>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Solver Application
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Complete the 3-step verification to gain access to premium problem listings.
        </p>
      </div>

      {/* Interactive Stepper with Progress Bar */}
      <Stepper
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(step) => {
          // allow stepping backwards if completed
          if (step < currentStep) setCurrentStep(step);
        }}
      />

      {/* ========================================================
          STEP 1: Basic Details
      ======================================================== */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit1(onStep1Submit)} className="space-y-4 animate-in fade-in">
          <Input
            label="Full Name *"
            placeholder="e.g. Dr. Rajesh Raman"
            type="text"
            autoComplete="name"
            leftIcon={<User className="w-4 h-4" />}
            error={errors1.fullName?.message}
            {...register1('fullName')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              placeholder="rajesh@domain.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors1.email?.message}
              {...register1('email')}
            />

            <Input
              label="Mobile Number (India +91) *"
              placeholder="+91 98450 12345"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors1.phone?.message}
              {...register1('phone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label="Password *"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors1.password?.message}
              {...register1('password')}
            />

            <PasswordInput
              label="Confirm Password *"
              placeholder="Re-enter password"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors1.confirmPassword?.message}
              {...register1('confirmPassword')}
            />
          </div>

          <Input
            label="City / Location in India *"
            placeholder="e.g. Bengaluru, Karnataka, India"
            type="text"
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors1.city?.message}
            {...register1('city')}
          />

          {/* Short Bio with Character Counter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">
                Short Professional Bio *
              </label>
              <span
                className={`text-xs ${
                  bioValue.length > 300 ? 'text-rose-500 font-bold' : 'text-slate-400'
                }`}
              >
                {bioValue.length}/300
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Describe your engineering focus, past achievements, or technical problem domains..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              {...register1('bio')}
            />
            {errors1.bio && (
              <p className="text-xs font-medium text-rose-500">{errors1.bio.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step 2
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================
          STEP 2: Qualifications & Skills
      ======================================================== */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit2(onStep2Submit)} className="space-y-5 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Highest Qualification *"
              options={[
                { value: 'High School', label: 'High School' },
                { value: 'Diploma', label: 'Diploma / Associate' },
                { value: "Bachelor's", label: "Bachelor's Degree" },
                { value: "Master's", label: "Master's Degree" },
                { value: 'PhD', label: 'Doctorate / PhD' },
                { value: 'Other', label: 'Other Professional Certification' },
              ]}
              error={errors2.highestQualification?.message}
              {...register2('highestQualification')}
            />

            <Input
              label="Field of Study / Specialization *"
              placeholder="e.g. Computer Science, Robotics, Finance"
              error={errors2.fieldOfStudy?.message}
              {...register2('fieldOfStudy')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Institution / University Name *"
                placeholder="e.g. Stanford University"
                error={errors2.institution?.message}
                {...register2('institution')}
              />
            </div>
            <div>
              <Input
                label="Completion Year *"
                placeholder="e.g. 2018"
                maxLength={4}
                error={errors2.completionYear?.message}
                {...register2('completionYear')}
              />
            </div>
          </div>

          <Input
            label="Years of Relevant Professional Experience *"
            placeholder="e.g. 5"
            type="number"
            min={0}
            max={50}
            error={errors2.experienceYears?.message}
            {...register2('experienceYears')}
          />

          {/* Skills Multi-Select Tag Input */}
          <TagInput
            label="Skills & Expertise Areas * (Add custom tags or select suggestions)"
            tags={watchedSkills}
            onChange={(newTags) => setValue2('skills', newTags)}
            error={errors2.skills?.message}
            helperText="Press Enter or comma to create new tags"
          />

          {/* Repeatable Certifications */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Professional Certifications (Optional)
                </h4>
                <p className="text-xs text-slate-500">
                  Add AWS, GCP, Cisco, Scrum, or other verified badges.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendCert({ id: generateId(), name: '', issuer: '', year: '' })
                }
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Certification
              </Button>
            </div>

            {certFields.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700">
                    Certification #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCert(index)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    aria-label="Remove certification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Input
                    placeholder="Name (e.g. AWS Solutions Architect)"
                    {...register2(`certifications.${index}.name` as const)}
                    error={errors2.certifications?.[index]?.name?.message}
                  />
                  <Input
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    {...register2(`certifications.${index}.issuer` as const)}
                    error={errors2.certifications?.[index]?.issuer?.message}
                  />
                  <Input
                    placeholder="Year (e.g. 2023)"
                    maxLength={4}
                    {...register2(`certifications.${index}.year` as const)}
                    error={errors2.certifications?.[index]?.year?.message}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* File Upload for Supporting Documents */}
          <div className="pt-2">
            <FileUpload
              label="Upload Supporting Documents / Degree Certificates"
              files={watchedDocs}
              onChange={(files) => setValue2('documents', files)}
              helperText="Upload scans or transcripts of your diplomas, degree, or verified credentials"
            />
          </div>

          <div className="pt-4 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-8"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step 3
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================
          STEP 3: Social Profiles & Review Summary
      ======================================================== */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit3(onFinalSubmit)} className="space-y-6 animate-in fade-in">
          {/* Social Profiles - Clearly Marked OPTIONAL */}
          <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Social Profiles <span className="text-xs font-normal text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full">Clearly Optional</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connecting public profiles accelerates your vetting and adds verified badges.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSkipSocial}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Skip for now
              </button>
            </div>

            <div className="space-y-3">
              <Input
                label="LinkedIn Profile URL / ID"
                placeholder="linkedin.com/in/alex-rivera-dev"
                leftIcon={<Linkedin className="w-4 h-4 text-[#0077B5]" />}
                error={errors3.linkedIn?.message}
                {...register3('linkedIn')}
              />

              <Input
                label="Instagram Handle"
                placeholder="@alex.solves"
                leftIcon={<Instagram className="w-4 h-4 text-[#E4405F]" />}
                error={errors3.instagram?.message}
                {...register3('instagram')}
              />
            </div>
          </div>

          {/* Review Summary */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Review Application Summary
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Applicant:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {step1Data?.fullName}
                </span>
                <span className="text-slate-500 block">{step1Data?.email}</span>
                <span className="text-slate-500 block">{step1Data?.city}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Academic Background:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {step2Data?.highestQualification} in {step2Data?.fieldOfStudy}
                </span>
                <span className="text-slate-500 block">
                  {step2Data?.institution} ({step2Data?.completionYear})
                </span>
                <span className="text-slate-500 block">
                  {step2Data?.experienceYears} years of experience
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-xs font-medium mb-1.5">
                Target Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {step2Data?.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {step2Data?.documents && step2Data.documents.length > 0 && (
              <div>
                <span className="text-slate-400 block text-xs font-medium mb-1">
                  Attached Proofs:
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  {step2Data.documents.length} document(s) uploaded for manual verification.
                </p>
              </div>
            )}
          </div>

          {/* Terms & Code of Conduct */}
          <div className="pt-1">
            <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                {...register3('acceptTerms')}
              />
              <span className="leading-snug">
                I agree to the{' '}
                <a href="#terms" className="text-indigo-600 font-semibold hover:underline">
                  Solver Code of Conduct
                </a>{' '}
                and confirm that all credentials submitted are authentic and current.
              </span>
            </label>
            {errors3.acceptTerms && (
              <p className="text-xs text-rose-500 font-medium mt-1">
                {errors3.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="px-8 shadow-elevated"
              rightIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
