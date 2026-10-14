import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../features/landing/HeroSection';
import { HowItWorksSection } from '../features/landing/HowItWorksSection';
import { RoleSplitSection } from '../features/landing/RoleSplitSection';
import { CategoriesSection } from '../features/landing/CategoriesSection';
import { TrustStatsSection } from '../features/landing/TrustStatsSection';
import { TestimonialsSection } from '../features/landing/TestimonialsSection';
import { FaqSection } from '../features/landing/FaqSection';
import { FinalCtaSection } from '../features/landing/FinalCtaSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustStatsSection />
        <HowItWorksSection />
        <RoleSplitSection />
        <CategoriesSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
};
