import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Menu, X, Info } from 'lucide-react';
import { AthleteTierPricing } from './AthleteTierPricing';
import { QuickWinsDoThisWeek } from './QuickWinsDoThisWeek';
import { RiskOfInaction } from './RiskOfInaction';
import { ExecutiveSummary } from './ExecutiveSummary';
import { YourHiddenGoldmine } from './YourHiddenGoldmine';
import { BiggestShock } from './BiggestShock';
import { WhatPlayflyMAXMisses } from './WhatPlayflyMAXMisses';
import { ByTheNumbers } from './ByTheNumbers';
import { CompetitiveIntelligenceHeatmap } from './CompetitiveIntelligenceHeatmap';
import { WhatNeedsToHappenToday } from './WhatNeedsToHappenToday';
import { SchoolPerformanceCards } from './SchoolPerformanceCards';
import { TheRealQuestion } from './TheRealQuestion';
import { NetworkDashboard } from './NetworkDashboard';
import { IPImpactAnalysis } from './IPImpactAnalysis';
import { ActiveCampaigns } from './ActiveCampaigns';
import { BrandExpansionOpportunities } from './BrandExpansionOpportunities';
import { SchoolPartnersGrid } from './SchoolPartnersGrid';
import { PLAYFLY_MAX_PARTNERS } from '../data/playflyNetworkData';
import { PlayflyDataProvider, usePlayflyData, formatNumber } from '../contexts/PlayflyDataContext';
import { HiddenTalent } from './HiddenTalent';
import { CompetitorBenchmark } from './CompetitorBenchmark';
import { RealTimeCampaignOptimization } from './RealTimeCampaignOptimization';
import { AutomatedRecommendations } from './AutomatedRecommendations';
import { JABASecretSauce } from './JABASecretSauce';
import { TeamPageSponsorshipGap } from './TeamPageSponsorshipGap';

/**
 * PLAYFLY SPORTS NETWORK REPORT
 *
 * Comprehensive executive report showing network-wide performance,
 * opportunities, and recommendations across all 20 partner schools (177+ teams with data).
 */

interface PlayflyNetworkReportProps {
  onBack?: () => void;
}

function PlayflyNetworkReportInner({ onBack }: PlayflyNetworkReportProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('executive-summary');
  const partnerSchools = PLAYFLY_MAX_PARTNERS;
  const { networkTotals } = usePlayflyData();

  // Refs for scrolling to sections
  const sectionRefs = {
    'executive-summary': useRef<HTMLDivElement>(null),
    'hidden-goldmine': useRef<HTMLDivElement>(null),
    'biggest-shock': useRef<HTMLDivElement>(null),
    'what-max-misses': useRef<HTMLDivElement>(null),
    'by-the-numbers': useRef<HTMLDivElement>(null),
    'competitive-intelligence': useRef<HTMLDivElement>(null),
    'what-needs-to-happen': useRef<HTMLDivElement>(null),
    'school-performance-cards': useRef<HTMLDivElement>(null),
    'the-real-question': useRef<HTMLDivElement>(null),
    'money-left-on-table': useRef<HTMLDivElement>(null),
    'team-page-gap': useRef<HTMLDivElement>(null),
    'athlete-tier-pricing': useRef<HTMLDivElement>(null),
    'quick-wins': useRef<HTMLDivElement>(null),
    'risk-of-inaction': useRef<HTMLDivElement>(null),
    'hidden-talent': useRef<HTMLDivElement>(null),
    'competitor-benchmark': useRef<HTMLDivElement>(null),
    'network-overview': useRef<HTMLDivElement>(null),
    'ip-analytics': useRef<HTMLDivElement>(null),
    'real-time-campaigns': useRef<HTMLDivElement>(null),
    'active-campaigns': useRef<HTMLDivElement>(null),
    'brand-opportunities': useRef<HTMLDivElement>(null),
    'partner-schools': useRef<HTMLDivElement>(null),
    'automated-recommendations': useRef<HTMLDivElement>(null),
    'jaba-secret-sauce': useRef<HTMLDivElement>(null),
  };

  const sections = [
    // NEW PERSUASION FLOW: Curiosity → Concern → Belief → Vision → Action → Decision
    { id: 'biggest-shock', name: '1. Biggest Shock (The Hook)', urgent: true },
    { id: 'hidden-goldmine', name: '2. Your Hidden Goldmine', urgent: true },
    { id: 'executive-summary', name: '3. The Playfly Opportunity', urgent: false },
    { id: 'what-max-misses', name: '4. What MAX Misses', urgent: true },
    { id: 'by-the-numbers', name: '5. Current vs Ideal State', urgent: false },
    { id: 'competitive-intelligence', name: '6. Competitive Intelligence', urgent: false },
    { id: 'what-needs-to-happen', name: '7. What Needs To Happen Today', urgent: true },
    { id: 'school-performance-cards', name: '8. School Performance Deep Dive', urgent: false },
    { id: 'the-real-question', name: '9. The Real Question', urgent: false },
    // Supporting sections
    { id: 'money-left-on-table', name: 'Money Left on Table', urgent: true },
    { id: 'team-page-gap', name: 'Team Page Gap', urgent: true },
    { id: 'athlete-tier-pricing', name: 'Athlete Tier Pricing', urgent: false },
    { id: 'quick-wins', name: 'Quick Wins', urgent: false },
    { id: 'risk-of-inaction', name: 'Risk of Inaction', urgent: true },
    { id: 'hidden-talent', name: 'Hidden Talent', urgent: false },
    { id: 'competitor-benchmark', name: 'Competitor Benchmark', urgent: false },
    { id: 'network-overview', name: 'Network Overview', urgent: false },
    { id: 'ip-analytics', name: 'IP Analytics', urgent: false },
    { id: 'real-time-campaigns', name: 'Real-Time Campaigns', urgent: false },
    { id: 'active-campaigns', name: 'Active Campaigns', urgent: false },
    { id: 'brand-opportunities', name: 'Brand Opportunities', urgent: false },
    { id: 'partner-schools', name: 'Partner Schools', urgent: false },
    { id: 'automated-recommendations', name: 'Automated Recommendations', urgent: false },
    { id: 'jaba-secret-sauce', name: "JABA's Secret Sauce", urgent: false },
  ];

  // Intersection observer to track which section is in view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    Object.entries(sectionRefs).forEach(([_id, ref]) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Back Button */}
      <button
        onClick={() => onBack ? onBack() : window.history.back()}
        className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {onBack ? 'Back to Playfly Reports' : 'Back to Schools'}
      </button>

      {/* Fixed Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-black/30 backdrop-blur-xl border-r border-white/10 flex-shrink-0 overflow-hidden fixed left-0 top-0 h-screen z-40`}
      >
        <div className="flex flex-col h-full pt-20 pb-6">
          {/* Header */}
          <div className="px-6 mb-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">PLAYFLY NETWORK</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="h-1 w-16 bg-[#1770C0]" />
            <p className="text-gray-400 text-xs mt-3">Executive Performance Report</p>
          </div>

          {/* Scrollable Navigation */}
          <nav className="space-y-1 px-6 overflow-y-auto flex-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${
                  activeSection === section.id
                    ? 'bg-[#1770C0] text-white font-semibold shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{section.name}</span>
                  {section.urgent && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'ml-80' : 'ml-0'} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}
          <div className={`flex-1 ${sidebarOpen ? '' : 'ml-14'}`}>
            <h1 className="text-2xl font-bold text-white">
              {sections.find(s => s.id === activeSection)?.name || 'Playfly Network Report'}
            </h1>
            <p className="text-xs text-gray-400">
              Playfly Sports Network • {networkTotals?.overview.schools ?? '—'} Schools ({formatNumber(networkTotals?.overview.totalPosts ?? 0)} Posts Analyzed) • February 2026
            </p>
          </div>
          <div className="relative group flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-white/8 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium cursor-default">
              <Info className="w-3 h-3" />
              <span>Preview Dataset</span>
            </div>
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-white/15 rounded-lg p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-xl">
              This report reflects a preview dataset while final data integrations are being completed. Metrics are directional and intended to demonstrate structure and insights.
            </div>
          </div>
        </div>

        {/* All Sections - Continuous Scroll */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-8 space-y-12">
            {/* JABA Hero Section - Data-Driven */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-8">
              {/* Dark gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />

              {/* Content */}
              <div className="relative z-10 p-12">
                {/* Headline with highlighted stat */}
                <h2 className="text-5xl font-bold mb-8 leading-tight">
                  <span className="text-white">JABA analyzed </span>
                  <span className="text-[#3B9FD9] bg-[#1770C0]/20 px-3 py-1 rounded-lg">{formatNumber(networkTotals?.overview.totalPosts ?? 0)} posts</span>
                  <span className="text-white"> and </span>
                  <span className="text-[#3B9FD9] bg-[#1770C0]/20 px-3 py-1 rounded-lg">{formatNumber(networkTotals?.overview.uniqueAthletes ?? 0)}+ athletes</span>
                  <span className="text-white"> in your network to find hidden opportunities.</span>
                </h2>

                {/* Accent bar */}
                <div className="h-1 w-40 bg-gradient-to-r from-[#3B9FD9] to-blue-500 mb-8" />

                {/* Key findings - Bullet points */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-5xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1770C0]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#3B9FD9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <div className="font-bold text-lg mb-1">We found:</div>
                      <div className="text-gray-300">Only <span className="text-[#3B9FD9] font-bold">{networkTotals ? Math.round((networkTotals.brandDeals.sponsoredPosts / networkTotals.overview.totalPosts) * 100) : 0}% of your posts are monetized</span> — {formatNumber((networkTotals?.overview.totalPosts ?? 0) - (networkTotals?.brandDeals.sponsoredPosts ?? 0))} high-performing posts untapped</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1770C0]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#3B9FD9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <div className="font-bold text-lg mb-1">Your network has:</div>
                      <div className="text-gray-300"><span className="text-[#3B9FD9] font-bold">{networkTotals ? Math.round(((networkTotals.overview.uniqueAthletes - networkTotals.brandDeals.sponsoredAthletes) / networkTotals.overview.uniqueAthletes) * 100) : 0}% of athletes unsponsored</span> across {networkTotals?.overview.schools ?? '—'} schools — massive revenue opportunity</div>
                    </div>
                  </div>
                </div>

                {/* CTA / Value prop */}
                <div className="bg-white/10 backdrop-blur-sm border-2 border-[#1770C0]/50 rounded-xl p-6 max-w-4xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1770C0] to-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <div className="font-bold text-xl mb-1">JABA identifies, matches, and manages these opportunities automatically</div>
                      <div className="text-gray-300 text-sm">Real-time campaign management across your entire network</div>
                    </div>
                  </div>
                </div>

                {/* Transition arrow */}
                <div className="mt-10 text-center">
                  <div className="inline-flex items-center gap-2 text-[#3B9FD9] font-semibold text-lg">
                    <span>Here's the full picture</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* === NEW PERSUASION FLOW: Curiosity → Concern → Belief → Vision → Action → Decision === */}

            {/* 1. BIGGEST SHOCK - The Hook (make them stop scrolling) */}
            <div ref={sectionRefs['biggest-shock']} data-section-id="biggest-shock" className="scroll-mt-20">
              <BiggestShock />
            </div>

            {/* 2. YOUR HIDDEN GOLDMINE - The Evidence (school-by-school proof) */}
            <div ref={sectionRefs['hidden-goldmine']} data-section-id="hidden-goldmine" className="scroll-mt-20">
              <YourHiddenGoldmine />
            </div>

            {/* 3. THE PLAYFLY OPPORTUNITY IN NUMBERS - Context & Scale */}
            <div ref={sectionRefs['executive-summary']} data-section-id="executive-summary" className="scroll-mt-20">
              <ExecutiveSummary />
            </div>

            {/* 4. WHAT PLAYFLY MAX IS MISSING - The Problem */}
            <div ref={sectionRefs['what-max-misses']} data-section-id="what-max-misses" className="scroll-mt-20">
              <WhatPlayflyMAXMisses />
            </div>

            {/* 5. CURRENT STATE VS IDEAL STATE - The Vision */}
            <div ref={sectionRefs['by-the-numbers']} data-section-id="by-the-numbers" className="scroll-mt-20">
              <ByTheNumbers />
            </div>

            {/* 6. COMPETITIVE INTELLIGENCE - The Sophistication (prove you understand their business) */}
            <div ref={sectionRefs['competitive-intelligence']} data-section-id="competitive-intelligence" className="scroll-mt-20">
              <CompetitiveIntelligenceHeatmap />
            </div>

            {/* 7. WHAT NEEDS TO HAPPEN TODAY - The Urgency (90-day action plan) */}
            <div ref={sectionRefs['what-needs-to-happen']} data-section-id="what-needs-to-happen" className="scroll-mt-20">
              <WhatNeedsToHappenToday />
            </div>

            {/* 8. SCHOOL-BY-SCHOOL PERFORMANCE DEEP DIVE - The Details (interactive exploration) */}
            <div ref={sectionRefs['school-performance-cards']} data-section-id="school-performance-cards" className="scroll-mt-20">
              <SchoolPerformanceCards />
            </div>

            {/* 9. THE REAL QUESTION - The Close (force the decision) */}
            <div ref={sectionRefs['the-real-question']} data-section-id="the-real-question" className="scroll-mt-20">
              <TheRealQuestion />
            </div>

            {/* === SUPPORTING SECTIONS (Additional Deep Dives) === */}

            {/* Money Left on Table - Temporarily disabled, needs restructuring to remove financial data
            <div ref={sectionRefs['money-left-on-table']} data-section-id="money-left-on-table" className="scroll-mt-20">
              <MoneyLeftOnTable />
            </div>
            */}

            {/* Team Page Gap */}
            <div ref={sectionRefs['team-page-gap']} data-section-id="team-page-gap" className="scroll-mt-20">
              <TeamPageSponsorshipGap />
            </div>

            {/* Athlete Tier Pricing */}
            <div ref={sectionRefs['athlete-tier-pricing']} data-section-id="athlete-tier-pricing" className="scroll-mt-20">
              <AthleteTierPricing />
            </div>

            {/* Quick Wins */}
            <div ref={sectionRefs['quick-wins']} data-section-id="quick-wins" className="scroll-mt-20">
              <QuickWinsDoThisWeek />
            </div>

            {/* Risk of Inaction */}
            <div ref={sectionRefs['risk-of-inaction']} data-section-id="risk-of-inaction" className="scroll-mt-20">
              <RiskOfInaction />
            </div>

            {/* Hidden Talent */}
            <div ref={sectionRefs['hidden-talent']} data-section-id="hidden-talent" className="scroll-mt-20">
              <HiddenTalent />
            </div>

            {/* Competitor Benchmark */}
            <div ref={sectionRefs['competitor-benchmark']} data-section-id="competitor-benchmark" className="scroll-mt-20">
              <CompetitorBenchmark />
            </div>

            {/* Network Overview */}
            <div ref={sectionRefs['network-overview']} data-section-id="network-overview" className="scroll-mt-20">
              <NetworkDashboard />
            </div>

            {/* IP Analytics */}
            <div ref={sectionRefs['ip-analytics']} data-section-id="ip-analytics" className="scroll-mt-20">
              <IPImpactAnalysis />
            </div>

            {/* Real-Time Campaigns */}
            <div ref={sectionRefs['real-time-campaigns']} data-section-id="real-time-campaigns" className="scroll-mt-20">
              <RealTimeCampaignOptimization />
            </div>

            {/* Active Campaigns */}
            <div ref={sectionRefs['active-campaigns']} data-section-id="active-campaigns" className="scroll-mt-20">
              <ActiveCampaigns />
            </div>

            {/* Brand Opportunities */}
            <div ref={sectionRefs['brand-opportunities']} data-section-id="brand-opportunities" className="scroll-mt-20">
              <BrandExpansionOpportunities />
            </div>

            {/* Partner Schools */}
            <div ref={sectionRefs['partner-schools']} data-section-id="partner-schools" className="scroll-mt-20">
              <SchoolPartnersGrid partners={partnerSchools} />
            </div>

            {/* Automated Recommendations */}
            <div ref={sectionRefs['automated-recommendations']} data-section-id="automated-recommendations" className="scroll-mt-20">
              <AutomatedRecommendations />
            </div>

            {/* JABA's Secret Sauce */}
            <div ref={sectionRefs['jaba-secret-sauce']} data-section-id="jaba-secret-sauce" className="scroll-mt-20">
              <JABASecretSauce />
            </div>

            {/* Methodology & Data Status */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-300">Methodology & Data Status</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p>
                  This report reflects a <span className="text-gray-300 font-medium">preview dataset</span> while final data integrations are being completed. Metrics are directional and intended to demonstrate the structure, depth, and actionable insights JABA delivers across the Playfly network.
                </p>
                <p>
                  <span className="text-gray-300 font-medium">Data sources:</span> Athlete social media metrics, brand partnership activity, and IP content signals are aggregated from {networkTotals?.overview.schools ?? '—'} Playfly partner schools covering {formatNumber(networkTotals?.overview.totalPosts ?? 0)} posts, {formatNumber(networkTotals?.overview.uniqueAthletes ?? 0)} athletes, and {formatNumber(networkTotals?.brandDeals.uniqueBrands ?? 0)} brand partners.
                </p>
                <p>
                  <span className="text-gray-300 font-medium">EMV (Estimated Media Value):</span> Calculated as (Likes × $0.50) + (Comments × $1.50) per post. This is a standard industry metric estimating the equivalent paid advertising value of organic social engagement.
                </p>
                <p>
                  <span className="text-gray-300 font-medium">IP Engagement Lift:</span> Measures the percentage increase in average engagement when posts include school intellectual property (logos, mentions, or collaborations) versus posts without IP signals.
                </p>
                <p className="text-gray-500 text-xs pt-2 border-t border-white/10">
                  Report generated February 2026 • Data pipeline powered by JABA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayflyNetworkReport({ onBack }: PlayflyNetworkReportProps = {}) {
  return (
    <PlayflyDataProvider>
      <PlayflyNetworkReportInner onBack={onBack} />
    </PlayflyDataProvider>
  );
}
