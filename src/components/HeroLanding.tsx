import React from 'react';
import { ViewMode } from '../types';
import { Users, ShieldCheck, Sparkles, Award, ArrowRight, Layers, FileText, CheckCircle, MapPin, Lock, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

interface HeroLandingProps {
  onNavigate: (view: ViewMode) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onNavigate }) => {
  const settings = useSettings();

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 lg:px-8 py-10 bg-black overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#001F3F] via-[#0057FF]/25 to-[#00A8FF]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#0057FF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#00A8FF]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Overlay Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#0057FF_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      {/* VENUE WATERMARK: THEYYOTTUCHIRA */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none opacity-[0.04] sm:opacity-[0.06] z-0">
        <span className="text-[15vw] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap rotate-[-6deg] blur-[0.5px]">
          THEYYOTTUCHIRA
        </span>
      </div>

      <div className="relative max-w-6xl mx-auto w-full z-10 flex flex-col items-center">
        {/* Top Header Badge & Title */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-8"
        >
          {/* Prominent Madrasa Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#001F3F] via-[#0057FF]/40 to-[#001F3F] border border-[#00A8FF]/50 text-white text-xs sm:text-sm font-black uppercase tracking-widest backdrop-blur-md mb-3 shadow-lg shadow-[#0057FF]/30">
            <Sparkles className="w-4 h-4 text-[#00A8FF]" />
            <span className="text-[#00A8FF]">KAMMUSUFI SUNI CENTRE MADRASA</span>
            <Sparkles className="w-4 h-4 text-[#00A8FF]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#00A8FF]" />
            <span>VENUE: THEYYOTTUCHIRA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            {settings.appName}
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto mt-2 font-medium">
            Kammusufi Suni Centre Madrasa, Theyyottuchira — Official real-time portal for managing participants, categories, stage attendance, and competition results.
          </p>
        </motion.div>

        {/* BENTO GRID LAYOUT */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Bento Cell 1: Team A Portal (Large) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => onNavigate('team_a')}
            className="col-span-1 glass-card p-5 sm:p-6 md:p-8 flex flex-col justify-between group hover:border-[#00A8FF] transition-all duration-300 cursor-pointer relative overflow-hidden blue-glow-sm hover:blue-glow"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-32 h-32 text-[#00A8FF]" />
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl blue-gradient border border-white/20 flex items-center justify-center mb-4 shadow-lg shadow-[#0057FF]/40">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/30 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#00A8FF]" />
                  <span>PROTECTED DIRECTORY</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00A8FF] transition-colors mb-2">
                {settings.teamAName} Portal
              </h2>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                Access complete rosters for {settings.teamAName} team students using password authentication (<code className="text-[#00A8FF]">cairo123</code>).
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#00A8FF] group-hover:translate-x-1.5 transition-transform">
              <span>Explore {settings.teamAName} Roster</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Bento Cell 2: Cordoba Portal (Large) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => onNavigate('team_b')}
            className="col-span-1 glass-card p-5 sm:p-6 md:p-8 flex flex-col justify-between group hover:border-[#00A8FF] transition-all duration-300 cursor-pointer relative overflow-hidden blue-glow-sm hover:blue-glow"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-32 h-32 text-[#0057FF]" />
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl blue-gradient border border-white/20 flex items-center justify-center mb-4 shadow-lg shadow-[#0057FF]/40">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#0057FF]/30 text-[#00A8FF] border border-[#0057FF]/50 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#00A8FF]" />
                  <span>PROTECTED DIRECTORY</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00A8FF] transition-colors mb-2">
                {settings.teamBName} Portal
              </h2>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                Access complete rosters for {settings.teamBName} team students using password authentication (<code className="text-[#00A8FF]">cordoba123</code>).
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#00A8FF] group-hover:translate-x-1.5 transition-transform">
              <span>Explore {settings.teamBName} Roster</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Bento Cell 3: Admin Portal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onClick={() => onNavigate('admin')}
            className="col-span-1 md:col-span-2 p-5 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#001F3F] via-[#0057FF]/40 to-[#001F3F] border border-[#00A8FF]/50 hover:border-[#00A8FF] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group transition-all duration-300 cursor-pointer blue-glow hover:shadow-2xl hover:shadow-[#0057FF]/60"
          >
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="p-3.5 sm:p-4 rounded-2xl blue-gradient border border-white/30 text-white shadow-xl shadow-[#0057FF]/50 shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#00A8FF] text-black font-extrabold inline-block mb-2">
                  CONTROL CENTER
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00A8FF] transition-colors">
                  Admin Portal & Program Management
                </h3>
                <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                  Secure admin dashboard to register new participants, assign students, configure custom competition programs, and export official PDF reports.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#00A8FF] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-white transition-colors shrink-0 shadow-lg">
              <span>Launch Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>

        {/* Feature Grid Bento Row */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* New Functional Stage Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            onClick={() => onNavigate('stage')}
            className="glass-card p-5 rounded-2xl flex flex-col justify-between group hover:border-[#00A8FF] transition-all duration-300 cursor-pointer blue-glow-sm hover:blue-glow relative overflow-hidden"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] text-white border border-white/20 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00A8FF] transition-colors">
                    Stage Portal
                  </h4>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                    LIVE VENUE CHECK-IN
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Manage stage attendance, participant check-in, and live competition tracking.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('stage');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-black transition-colors shadow-md border border-white/20 cursor-pointer"
            >
              <span>Open Stage Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#0057FF]/20 text-[#00A8FF] border border-[#0057FF]/30 shrink-0">
                <CheckCircle className="w-5 h-5 text-[#00A8FF]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                  Realtime Database
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Instant updates across all portals
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#0057FF]/20 text-[#00A8FF] border border-[#0057FF]/30 shrink-0">
                <FileText className="w-5 h-5 text-[#00A8FF]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                  PDF Report Export
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Printable official competition lists
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
