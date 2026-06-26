/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import CitizenPortal from './components/CitizenPortal';
import MunicipalityPortal from './components/MunicipalityPortal';
import { motion } from 'motion/react';
import { 
  HeartHandshake, 
  ArrowRight, 
  Building2, 
  UserRound, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'citizen' | 'municipality'>('landing');

  if (view === 'citizen') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <CitizenPortal 
          onBackToHome={() => setView('landing')} 
          onNavigateToMunicipality={() => setView('municipality')} 
        />
      </motion.div>
    );
  }

  if (view === 'municipality') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <MunicipalityPortal 
          onBackToHome={() => setView('landing')} 
          onNavigateToCitizen={() => setView('citizen')} 
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans text-slate-800 p-4 sm:p-6 md:p-8 lg:p-10 gap-8 justify-start" 
      id="landing-screen"
    >
      
      {/* Upper Subtle Announcement Bar styled with soft warmth */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-amber-50/50 text-amber-900 border border-amber-100/40 rounded-2xl text-center py-2 px-5 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)] max-w-5xl w-full mx-auto"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-600 fill-amber-200/10 animate-pulse" />
        <span>Every neighborhood report counts. Nagpur’s citizen-municipal alliance is live and resolving issues.</span>
      </motion.div>

      {/* Global Navigation Header - clean, floating, premium */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-5xl mx-auto flex items-center justify-between bg-white px-6 py-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01),0_8px_20px_rgba(0,0,0,0.02)] border border-slate-150"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 bg-gradient-to-tr from-sky-600 to-sky-500 rounded-xl flex items-center justify-center text-white text-lg shadow-xs select-none cursor-pointer"
          >
            🤝
          </motion.div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 font-display">Community Hero</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Civic Collaboration • Nagpur</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border border-emerald-100/50 flex items-center gap-1.5 shadow-3xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Nagpur Operations Live
          </span>
          <span className="text-[9px] bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border border-sky-100/50 flex items-center gap-1.5 shadow-3xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
            </span>
            AI Priority Active
          </span>
        </div>
      </motion.header>

      {/* Main Container Layout */}
      <main className="flex-grow flex flex-col items-center max-w-5xl w-full mx-auto space-y-10">
        
        {/* Refined Hero / Value Proposition */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-5 max-w-3xl pt-2"
        >
          <div className="inline-flex items-center gap-2 bg-sky-50/60 border border-sky-100/60 px-4 py-1 rounded-full shadow-3xs">
            <HeartHandshake className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Nagpur Citizen & City Partnership</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-[50px] font-extrabold text-slate-900 tracking-tight font-display leading-[1.15] max-w-2xl mx-auto">
            Connecting citizens and city teams <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">to shape Nagpur's neighborhoods.</span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-[16px] text-slate-500/90 font-medium leading-relaxed max-w-xl mx-auto">
            Community Hero brings residents and local municipal teams into a single, shared workspace. Together, we identify neighborhood needs, coordinate repairs, and build a safer, cleaner city.
          </p>
        </motion.section>

        {/* Portal Entry Cards Grid - beautiful, modern, human-centric */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          
          {/* Card: Citizen Portal Option */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.04)", borderColor: "#7dd3fc" }}
            className="bg-white border border-slate-200/60 rounded-[28px] p-8 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.01),0_12px_36px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="space-y-5">
              <div className="h-11 w-11 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center border border-sky-100/50 text-xl shadow-3xs group-hover:scale-105 transition-transform duration-300">
                👤
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">For Residents</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">Report & Track Neighborhood Issues</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Filing potholes, broken streetlamps, or water leakage takes seconds. Drag a pin on the map, describe the issue, and see real-time progress as city crews set out to resolve it.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 space-y-3.5">
              <motion.button
                onClick={() => setView('citizen')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-xs shadow-3xs hover:shadow-xs transition-all duration-300 select-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Access Citizen Portal</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
              <div className="text-[10px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                No login required • File reports anonymously
              </div>
            </div>
          </motion.div>

          {/* Card: Municipality Portal Option */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.04)", borderColor: "#cbd5e1" }}
            className="bg-white border border-slate-200/60 rounded-[28px] p-8 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.01),0_12px_36px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="space-y-5">
              <div className="h-11 w-11 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-150 text-xl shadow-3xs group-hover:scale-105 transition-transform duration-300">
                🏛️
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">For Administration</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">Municipal Crew Dispatch Console</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  A high-priority workspace designed for Nagpur municipal engineers. Review automated safety-risk assessments, coordinate maintenance crews, and log resolution checklists.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 space-y-3.5">
              <motion.button
                onClick={() => setView('municipality')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl text-xs shadow-3xs hover:shadow-xs transition-all duration-300 select-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Access Municipal Console</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
              <div className="text-[10px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Secure portal • Demands admin testing credentials
              </div>
            </div>
          </motion.div>

        </div>

        {/* Feature Grid illustrating partnership value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-2">
          
          {/* Card: Mutual Visibility */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            whileHover={{ y: -3, borderColor: "#cbd5e1" }}
            className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4 transition-all duration-300"
          >
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-3xs">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 font-display text-sm">Community Map</h4>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed font-medium">
                See what is happening in your neighborhood on a shared local map, helping residents and city crews look at the exact same picture.
              </p>
            </div>
          </motion.div>

          {/* Card: Intelligent Triage */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            whileHover={{ y: -3, borderColor: "#cbd5e1" }}
            className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4 transition-all duration-300"
          >
            <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100/50 shadow-3xs">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 font-display text-sm">Focusing on Urgency</h4>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed font-medium">
                We highlight street hazards that pose the highest safety risks first, ensuring critical issues get handled quickly to keep families safe.
              </p>
            </div>
          </motion.div>

          {/* Card: Transparent Pathways */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            whileHover={{ y: -3, borderColor: "#cbd5e1" }}
            className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4 transition-all duration-300"
          >
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 shadow-3xs">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 font-display text-sm">Shared Progress</h4>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed font-medium">
                Follow each report from the moment it is posted until the maintenance crew marks the job as done. Clear and transparent results.
              </p>
            </div>
          </motion.div>

        </div>

      </main>

      {/* Styled Bento-style Footer with Warmth */}
      <footer className="max-w-5xl w-full mx-auto border border-slate-200/60 py-4.5 px-6 text-center text-[10px] text-slate-400 font-semibold bg-white rounded-2xl shadow-3xs flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>🏛️ Nagpur Municipal Corporation • Community Hero Civic Collaboration</p>
        <p className="font-mono">Secure Sandboxed Demo • No commercial credentials required</p>
      </footer>

    </motion.div>
  );
}


