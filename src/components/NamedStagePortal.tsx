import React, { useState, useEffect, useMemo } from 'react';
import { Participant, Program, Team } from '../types';
import { subscribeParticipants, updateAttendanceStatus } from '../services/participantService';
import { subscribePrograms } from '../services/programService';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Unlock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Users,
  Check,
  Trophy,
  Filter,
  CheckSquare,
  Square,
  Loader2,
  Clock,
  Mic,
  BookOpen,
  Palette,
  Music,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NamedStagePortalProps {
  onBack?: () => void;
  isAdminLoggedIn?: boolean;
}

// Icon helper for competition types
const getCompetitionIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elocution') || lower.includes('speech') || lower.includes('speech') || lower.includes('lecture')) {
    return '🎤';
  }
  if (lower.includes('essay') || lower.includes('story') || lower.includes('writing')) {
    return '📖';
  }
  if (lower.includes('drawing') || lower.includes('painting') || lower.includes('pencil') || lower.includes('poster')) {
    return '🎨';
  }
  if (lower.includes('song') || lower.includes('qirat') || lower.includes('singing') || lower.includes('nasheed') || lower.includes('burda')) {
    return '🎵';
  }
  if (lower.includes('calligraphy') || lower.includes('quiz')) {
    return '📜';
  }
  return '🏆';
};

export const NamedStagePortal: React.FC<NamedStagePortalProps> = ({
  onBack,
  isAdminLoggedIn = false
}) => {
  // Realtime Data State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<Team | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Pending'>('All');

  // Accordion Expand/Collapse State
  const [expandedCompetitions, setExpandedCompetitions] = useState<Record<string, boolean>>({});

  // Authorization / Pin State
  const [isCoordinatorUnlocked, setIsCoordinatorUnlocked] = useState(isAdminLoggedIn);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // Toast / Confirmation State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Updating lock state per participant
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  // Subscribe to real-time data
  useEffect(() => {
    const unsubParticipants = subscribeParticipants('All', (data) => {
      setParticipants(data);
      setLoading(false);
    });

    const unsubPrograms = subscribePrograms((pData) => {
      setPrograms(pData);
    });

    return () => {
      unsubParticipants();
      unsubPrograms();
    };
  }, []);

  // Sync admin state
  useEffect(() => {
    if (isAdminLoggedIn) {
      setIsCoordinatorUnlocked(true);
    }
  }, [isAdminLoggedIn]);

  // Handle PIN Unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'stage123' || pinInput.trim() === 'admin123') {
      setIsCoordinatorUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      showToast('Stage Coordinator controls unlocked successfully!');
    } else {
      setPinError('Invalid Stage PIN. Enter stage123 to unlock attendance checkboxes.');
    }
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Attendance Action via Checkbox
  const handleToggleAttendance = async (participant: Participant, currentStatus: string) => {
    if (!isCoordinatorUnlocked) {
      setShowPinModal(true);
      return;
    }

    if (updatingIds[participant.id]) return; // Prevent duplicate requests

    const newStatus: 'Present' | 'Pending' = currentStatus === 'Present' ? 'Pending' : 'Present';

    setUpdatingIds((prev) => ({ ...prev, [participant.id]: true }));
    try {
      await updateAttendanceStatus(participant.id, newStatus);
      if (newStatus === 'Present') {
        showToast(`✓ Marked ${participant.studentName} (${participant.team}) as PRESENT`);
      } else {
        showToast(`Marked ${participant.studentName} (${participant.team}) as PENDING`);
      }
    } catch (err) {
      console.error('Failed to update attendance:', err);
      showToast('Failed to update attendance. Please check your network.');
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [participant.id]: false }));
    }
  };

  // Construct Competition List dynamically from programs and participants
  const competitionList = useMemo(() => {
    const compMap = new Map<
      string,
      { name: string; category?: string; gender?: string; program?: Program }
    >();

    // 1. Add from programs database
    programs.forEach((prog) => {
      const name = prog.name.trim();
      if (name) {
        compMap.set(name.toLowerCase(), {
          name: name,
          category: prog.category,
          gender: prog.gender,
          program: prog
        });
      }
    });

    // 2. Add from participant assignments
    participants.forEach((p) => {
      const assigned = Array.isArray(p.assignedCompetitions) && p.assignedCompetitions.length > 0
        ? p.assignedCompetitions
        : p.competitionName
        ? [p.competitionName]
        : [];

      assigned.forEach((cName) => {
        const trimmed = cName.trim();
        if (trimmed && !compMap.has(trimmed.toLowerCase())) {
          compMap.set(trimmed.toLowerCase(), {
            name: trimmed,
            category: p.category,
            gender: p.gender
          });
        }
      });
    });

    return Array.from(compMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [programs, participants]);

  // Expand all by default on first load
  useEffect(() => {
    if (competitionList.length > 0 && Object.keys(expandedCompetitions).length === 0) {
      const initial: Record<string, boolean> = {};
      competitionList.forEach((c) => {
        initial[c.name] = true;
      });
      setExpandedCompetitions(initial);
    }
  }, [competitionList]);

  const toggleExpand = (compName: string) => {
    setExpandedCompetitions((prev) => ({
      ...prev,
      [compName]: !prev[compName]
    }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    competitionList.forEach((c) => {
      next[c.name] = true;
    });
    setExpandedCompetitions(next);
  };

  const handleCollapseAll = () => {
    setExpandedCompetitions({});
  };

  // Get filtered participants for a specific competition
  const getParticipantsForComp = (compName: string) => {
    return participants.filter((p) => {
      // Check assigned competition
      const assigned = Array.isArray(p.assignedCompetitions) && p.assignedCompetitions.length > 0
        ? p.assignedCompetitions
        : p.competitionName
        ? [p.competitionName]
        : [];

      const isForThisComp = assigned.some(
        (c) => c.trim().toLowerCase() === compName.trim().toLowerCase()
      );

      if (!isForThisComp) return false;

      // Apply Team Filter
      if (teamFilter !== 'All' && p.team !== teamFilter) {
        return false;
      }

      // Apply Status Filter
      const status = p.attendanceStatus || 'Pending';
      if (statusFilter !== 'All' && status !== statusFilter) {
        return false;
      }

      // Apply Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.studentName.toLowerCase().includes(q);
        const matchReg = (p.registrationNumber || '').toLowerCase().includes(q);
        const matchCode = (p.codeLetter || '').toLowerCase().includes(q);
        const matchTeam = p.team.toLowerCase().includes(q);
        const matchComp = compName.toLowerCase().includes(q);
        if (!matchName && !matchReg && !matchCode && !matchTeam && !matchComp) {
          return false;
        }
      }

      return true;
    });
  };

  // Overall Venue Summary Stats
  const totalVenueParticipants = participants.length;
  const totalVenuePresent = participants.filter((p) => p.attendanceStatus === 'Present').length;
  const totalVenuePending = totalVenueParticipants - totalVenuePresent;

  // Filtered Competition List based on search query
  const filteredCompetitions = competitionList.filter((comp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    // Match competition name
    if (comp.name.toLowerCase().includes(q)) return true;

    // Or match if any participant in this competition matches search query
    const compParticipants = getParticipantsForComp(comp.name);
    return compParticipants.length > 0;
  });

  return (
    <div className="min-h-[calc(100vh-65px)] bg-black text-slate-100 p-4 md:p-8 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#001F3F] via-[#0057FF]/20 to-[#00A8FF]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Confirmation Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#001F3F] via-[#0057FF] to-[#00A8FF] border border-white/30 text-white font-bold text-xs md:text-sm shadow-2xl shadow-[#0057FF]/60 flex items-center gap-3 backdrop-blur-xl"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Top Header & Access Mode Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#001F3F]/40 border border-[#0057FF]/40 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3 rounded-2xl bg-black/60 border border-[#0057FF]/40 text-[#00A8FF] hover:bg-[#0057FF] hover:text-white transition-all cursor-pointer"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] text-white shadow-xl shadow-[#0057FF]/40">
              <UserCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40">
                  LIVE VENUE CHECK-IN
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                STAGE PORTAL
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Competition-wise participant check-in and stage arrival management
              </p>
            </div>
          </div>

          {/* Access Mode Badge & Coordinator Unlock */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {isCoordinatorUnlocked ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-950/50">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Coordinator Mode (Active)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 text-xs font-semibold">
                  <span>View Only Mode</span>
                </div>
                <button
                  onClick={() => setShowPinModal(true)}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-[#0057FF]/40 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enter Stage PIN</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* OVERALL VENUE STAGE SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#001F3F]/30 border border-[#0057FF]/40 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Competitions
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{competitionList.length}</h2>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0057FF]/20 border border-[#0057FF]/40 text-[#00A8FF] shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#001F3F]/30 border border-[#0057FF]/40 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Total Registered
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalVenueParticipants}</h2>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0057FF]/20 border border-[#0057FF]/40 text-[#00A8FF] shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Present
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{totalVenuePresent}</h2>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/25 border border-amber-500/40 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                Pending Call
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{totalVenuePending}</h2>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <div className="p-5 rounded-2xl bg-[#001F3F]/30 border border-[#0057FF]/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by participant name, reg no, or competition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/80 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Team Filter */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-[#0057FF]/30">
              {(['All', 'Cairo', 'Cordoba'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTeamFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    teamFilter === t
                      ? 'bg-[#0057FF] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'All' ? 'All Teams' : t}
                </button>
              ))}
            </div>

            {/* Attendance Status Filter */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-[#0057FF]/30">
              {(['All', 'Present', 'Pending'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === s
                      ? s === 'Present'
                        ? 'bg-emerald-600 text-white'
                        : s === 'Pending'
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#00A8FF] text-black font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Collapse / Expand Controls */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-[#0057FF]/30 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-[#0057FF]/30 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* COMPETITION-BASED ACCORDION LAYOUT */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00A8FF] animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Stage Competitions...</p>
          </div>
        ) : filteredCompetitions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#001F3F]/20 border border-[#0057FF]/30 text-center text-slate-400">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Competitions Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompetitions.map((comp) => {
              const compParticipants = getParticipantsForComp(comp.name);
              const isExpanded = !!expandedCompetitions[comp.name];

              const totalCompCount = compParticipants.length;
              const presentCompCount = compParticipants.filter(
                (p) => p.attendanceStatus === 'Present'
              ).length;
              const pendingCompCount = totalCompCount - presentCompCount;

              const compIcon = getCompetitionIcon(comp.name);

              return (
                <div
                  key={comp.name}
                  className="rounded-2xl bg-[#001F3F]/30 border border-[#0057FF]/40 hover:border-[#00A8FF]/60 backdrop-blur-xl shadow-xl overflow-hidden transition-all duration-200"
                >
                  {/* COMPETITION CARD HEADER */}
                  <div
                    onClick={() => toggleExpand(comp.name)}
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#0057FF]/10 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] text-white flex items-center justify-center text-xl shadow-md shadow-[#0057FF]/40 shrink-0">
                        <span>{compIcon}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg md:text-xl font-black text-white group-hover:text-[#00A8FF]">
                            {comp.name}
                          </h2>
                          {comp.category && (
                            <span className="px-2 py-0.5 rounded-md bg-[#0057FF]/30 border border-[#00A8FF]/40 text-[#00A8FF] text-[10px] font-extrabold uppercase">
                              {comp.category}
                            </span>
                          )}
                          {comp.gender && (
                            <span className="px-2 py-0.5 rounded-md bg-pink-950/40 border border-pink-500/30 text-pink-300 text-[10px] font-extrabold uppercase">
                              {comp.gender}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Click to {isExpanded ? 'collapse' : 'expand'} participant check-in list
                        </p>
                      </div>
                    </div>

                    {/* COMPETITION SUMMARY COUNTS */}
                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                      <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-xl border border-[#0057FF]/30 text-xs font-bold">
                        <span className="text-slate-400">Total: <strong className="text-white">{totalCompCount}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">Present: <strong>{presentCompCount}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-400">Pending: <strong>{pendingCompCount}</strong></span>
                      </div>

                      <div className="p-2 rounded-xl bg-black/40 border border-[#0057FF]/30 text-[#00A8FF]">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE PARTICIPANT TABLE */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#0057FF]/25 bg-black/40"
                      >
                        {compParticipants.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs italic">
                            No participants registered for this competition matching current search/filters.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-[#001F3F]/60 text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#0057FF]/20">
                                  <th className="py-3 px-4 w-12 text-center">Sl No</th>
                                  <th className="py-3 px-4">Participant Name</th>
                                  <th className="py-3 px-4">Team</th>
                                  <th className="py-3 px-4">Registration No</th>
                                  <th className="py-3 px-4 text-center w-40">Attendance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#0057FF]/15">
                                {compParticipants.map((participant, index) => {
                                  const isPresent = participant.attendanceStatus === 'Present';
                                  const isSaving = !!updatingIds[participant.id];

                                  return (
                                    <tr
                                      key={participant.id}
                                      className={`hover:bg-[#0057FF]/10 transition-colors ${
                                        isPresent ? 'bg-emerald-950/15' : ''
                                      }`}
                                    >
                                      {/* Sl No */}
                                      <td className="py-3.5 px-4 font-extrabold text-slate-400 text-center">
                                        {index + 1}
                                      </td>

                                      {/* Participant Name */}
                                      <td className="py-3.5 px-4 font-bold text-white">
                                        <div className="flex items-center gap-2.5">
                                          <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] text-white shrink-0 ${
                                              participant.team === 'Cairo'
                                                ? 'bg-sky-600'
                                                : 'bg-emerald-600'
                                            }`}
                                          >
                                            {participant.studentName[0].toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="text-white font-bold leading-tight">
                                              {participant.studentName}
                                            </p>
                                            {participant.class && (
                                              <p className="text-[10px] text-slate-400 font-normal">
                                                {participant.class}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Team */}
                                      <td className="py-3.5 px-4">
                                        <span
                                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                                            participant.team === 'Cairo'
                                              ? 'bg-sky-950/80 text-sky-300 border border-sky-500/30'
                                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                          }`}
                                        >
                                          {participant.team} Team
                                        </span>
                                      </td>

                                      {/* Registration Number */}
                                      <td className="py-3.5 px-4 font-mono font-bold text-[#00A8FF]">
                                        {participant.registrationNumber || participant.codeLetter || `#${100 + index}`}
                                      </td>

                                      {/* Attendance Checkbox Column */}
                                      <td className="py-3.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={isPresent}
                                              disabled={isSaving}
                                              onChange={() => handleToggleAttendance(participant, participant.attendanceStatus || 'Pending')}
                                              className="sr-only"
                                            />
                                            <div
                                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                                isPresent
                                                  ? 'bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/40'
                                                  : 'bg-black/60 border-slate-600 hover:border-[#00A8FF] text-transparent'
                                              }`}
                                            >
                                              {isSaving ? (
                                                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                              ) : (
                                                <Check className="w-4 h-4 stroke-[3]" />
                                              )}
                                            </div>
                                            <span
                                              className={`text-xs font-black uppercase tracking-wider ${
                                                isPresent ? 'text-emerald-400' : 'text-slate-400'
                                              }`}
                                            >
                                              {isPresent ? 'Present' : 'Not Arrived'}
                                            </span>
                                          </label>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STAGE COORDINATOR PIN MODAL */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#001F3F] border border-[#0057FF]/50 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] text-white">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Stage Coordinator Unlock</h3>
                  <p className="text-xs text-slate-300">Enter Stage PIN to mark participant attendance</p>
                </div>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Stage PIN Code
                  </label>
                  <input
                    type="password"
                    placeholder="Enter stage PIN (e.g. stage123)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full bg-black/80 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none transition-all"
                    autoFocus
                  />
                  {pinError && <p className="text-xs text-rose-400 font-medium mt-1.5">{pinError}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs uppercase hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#0057FF]/40 hover:opacity-90 transition-all cursor-pointer"
                  >
                    Unlock Stage Mode
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
