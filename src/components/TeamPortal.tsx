import React, { useState, useEffect } from 'react';
import { Participant, Team, Category, Gender, Program } from '../types';
import {
  subscribeParticipants,
  assignCompetitionToParticipant,
  removeCompetitionFromParticipant
} from '../services/participantService';
import { subscribePrograms } from '../services/programService';
import { AssignCompetitionCell } from './AssignCompetitionCell';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  BookOpen,
  Trophy,
  ArrowLeft,
  RefreshCw,
  Printer,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePdfReport } from '../utils/pdfGenerator';

interface TeamPortalProps {
  team: Team;
  onBack: () => void;
}

export const TeamPortal: React.FC<TeamPortalProps> = ({ team, onBack }) => {
  const sessionKey = `team_unlocked_${team}`;
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(sessionKey) === 'true';
  });

  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedGender, setSelectedGender] = useState<Gender | 'All'>('All');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const defaultPassword = team === 'Cairo' ? 'cairo123' : 'cordoba123';

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    const trimmed = passwordInput.trim().toLowerCase();

    const validPasswords = [
      defaultPassword,
      team.toLowerCase(),
      `${team.toLowerCase()}2026`,
      'admin123'
    ];

    if (validPasswords.includes(trimmed)) {
      sessionStorage.setItem(sessionKey, 'true');
      setIsUnlocked(true);
      setPasswordInput('');
    } else {
      setPasswordError(`Incorrect password. Please try '${defaultPassword}'`);
    }
  };

  const handleLockPortal = () => {
    sessionStorage.removeItem(sessionKey);
    setIsUnlocked(false);
  };

  const [allPrograms, setAllPrograms] = useState<Program[]>([]);

  // Realtime subscription to Firebase Firestore (only fetch if unlocked)
  useEffect(() => {
    if (!isUnlocked) return;
    setLoading(true);
    const unsubParticipants = subscribeParticipants(team, (data) => {
      setParticipants(data);
      setLoading(false);
    });
    const unsubPrograms = subscribePrograms((progData) => {
      setAllPrograms(progData);
    });

    return () => {
      unsubParticipants();
      unsubPrograms();
    };
  }, [team, isUnlocked]);

  // Extract unique competitions for dropdown filter
  const uniqueCompetitions = Array.from(
    new Set([
      ...allPrograms.map((pr) => pr.name),
      ...participants.map((p) => p.competitionName)
    ])
  ).filter(Boolean).sort();

  // Filter logic
  const filteredParticipants = participants.filter((p) => {
    // Category filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    // Gender filter
    if (selectedGender !== 'All' && p.gender !== selectedGender) {
      return false;
    }
    // Competition filter
    if (selectedCompetition !== 'All' && p.competitionName !== selectedCompetition) {
      return false;
    }
    // Search query (Student Name, Class, Competition)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.studentName.toLowerCase().includes(q);
      const matchClass = p.class.toLowerCase().includes(q);
      const matchComp = p.competitionName.toLowerCase().includes(q);
      if (!matchName && !matchClass && !matchComp) {
        return false;
      }
    }
    return true;
  });

  // Calculate statistics
  const subJuniorCount = participants.filter((p) => p.category === 'Sub Junior').length;
  const juniorCount = participants.filter((p) => p.category === 'Junior').length;
  const seniorCount = participants.filter((p) => p.category === 'Senior').length;
  const boysCount = participants.filter((p) => p.gender === 'Boys').length;
  const girlsCount = participants.filter((p) => p.gender === 'Girls').length;

  const handleDownloadPdf = () => {
    generatePdfReport({
      team,
      category: selectedCategory,
      gender: selectedGender,
      competitionName: selectedCompetition === 'All' ? '' : selectedCompetition,
      participants: filteredParticipants
    });
  };

  // RENDER LOCKED SCREEN IF NOT AUTHENTICATED
  if (!isUnlocked) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-black px-4 py-12 text-white flex items-center justify-center relative overflow-hidden">
        {/* Background Ambient Lights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#0057FF]/30 to-[#00A8FF]/20 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#001F3F]/50 border border-[#0057FF]/50 backdrop-blur-2xl shadow-2xl shadow-[#0057FF]/20 text-center"
        >
          {/* Back Button */}
          <div className="flex justify-start mb-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Lock Icon Header */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#001F3F] to-[#0057FF] border border-[#00A8FF]/50 flex items-center justify-center text-[#00A8FF] shadow-lg shadow-[#0057FF]/40">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8FF]/10 border border-[#00A8FF]/30 text-[#00A8FF] text-[10px] font-bold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PASSWORD PROTECTED PORTAL</span>
          </div>

          <h2 className="text-2xl font-black uppercase text-white tracking-tight mb-1">
            {team} Team Portal
          </h2>
          <p className="text-xs text-slate-300 mb-6">
            Enter the {team} team password to access the participant directory.
          </p>

          {/* Password Form */}
          <form onSubmit={handleUnlockSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                {team} Team Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={`Enter ${team.toLowerCase()} password...`}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-black/80 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Default Password Hint Pill */}
            <div className="p-3 rounded-xl bg-[#001F3F]/70 border border-[#0057FF]/30 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Default Access Pass:</span>
              <code className="font-mono font-bold text-[#00A8FF] bg-black/60 px-2 py-0.5 rounded border border-[#00A8FF]/30">
                {defaultPassword}
              </code>
            </div>

            {/* Unlock Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0057FF] to-[#00A8FF] hover:from-[#00A8FF] hover:to-[#0057FF] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-[#0057FF]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock {team} Portal</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-black px-4 lg:px-8 py-8 text-white relative">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0057FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#00A8FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Header Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#00A8FF] hover:text-white bg-[#001F3F]/60 border border-[#0057FF]/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>

              <button
                onClick={handleLockPortal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Lock this team portal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Portal</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#001F3F] to-[#0057FF] border border-[#00A8FF]/40 text-white shadow-lg shadow-[#0057FF]/30">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>{team} PORTAL</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    UNLOCKED
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Official Participant Directory & Competition Records
                </p>
              </div>
            </div>
          </div>

          {/* Quick PDF export trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={filteredParticipants.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0057FF] to-[#00A8FF] hover:from-[#00A8FF] hover:to-[#0057FF] text-white text-xs font-bold shadow-lg shadow-[#0057FF]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {team} List</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="p-3.5 rounded-xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Students</p>
            <p className="text-2xl font-black text-white mt-0.5">{participants.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Sub Junior</p>
            <p className="text-2xl font-black text-[#00A8FF] mt-0.5">{subJuniorCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Junior</p>
            <p className="text-2xl font-black text-[#00A8FF] mt-0.5">{juniorCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Senior</p>
            <p className="text-2xl font-black text-[#00A8FF] mt-0.5">{seniorCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Boys</p>
            <p className="text-2xl font-black text-blue-400 mt-0.5">{boysCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Girls</p>
            <p className="text-2xl font-black text-pink-400 mt-0.5">{girlsCount}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-5 rounded-2xl bg-[#001F3F]/30 border border-[#0057FF]/30 backdrop-blur-xl mb-8">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[#00A8FF] uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Filter Participant Roster</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Search Student / Class / Competition
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-black/60 rounded-xl border border-[#0057FF]/40">
                {(['All', 'Sub Junior', 'Junior', 'Senior'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      selectedCategory === cat
                        ? 'bg-[#0057FF] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'Sub Junior' ? 'Sub Jr' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-black/60 rounded-xl border border-[#0057FF]/40">
                {(['All', 'Boys', 'Girls'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                      selectedGender === g
                        ? 'bg-[#0057FF] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Competition Filter Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Competition Name
              </label>
              <select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
                className="w-full bg-black/60 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
              >
                <option value="All">All Competitions ({uniqueCompetitions.length})</option>
                {uniqueCompetitions.map((comp) => (
                  <option key={comp} value={comp} className="bg-slate-900 text-white">
                    {comp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators & Reset Button */}
          {(selectedCategory !== 'All' ||
            selectedGender !== 'All' ||
            selectedCompetition !== 'All' ||
            searchQuery !== '') && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#0057FF]/20">
              <p className="text-xs text-slate-400">
                Showing <strong className="text-[#00A8FF]">{filteredParticipants.length}</strong> of{' '}
                {participants.length} total participants
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedGender('All');
                  setSelectedCompetition('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Display Participant Cards / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#001F3F]/10 rounded-2xl border border-[#0057FF]/20">
            <RefreshCw className="w-8 h-8 text-[#00A8FF] animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300">Loading {team} roster...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#001F3F]/20 rounded-2xl border border-[#0057FF]/30 text-center">
            <UserCheck className="w-12 h-12 text-[#00A8FF]/50 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Participants Found</h3>
            <p className="text-xs text-slate-400 max-w-md mb-4">
              {participants.length === 0
                ? `No students registered for ${team} yet. Admin can register students from the Admin Portal.`
                : 'No participants match the selected filter criteria. Try clearing some filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#0057FF]/30 bg-[#001F3F]/20 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#001F3F]/80 text-[#00A8FF] uppercase text-[10px] font-bold tracking-wider border-b border-[#0057FF]/30">
                  <tr>
                    <th className="py-3.5 px-4">SL</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Gender</th>
                    <th className="py-3.5 px-4">Competition</th>
                    <th className="py-3.5 px-4">Assign Competition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0057FF]/15">
                  <AnimatePresence>
                    {filteredParticipants.map((p, idx) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        className="hover:bg-[#0057FF]/10 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] flex items-center justify-center text-white text-xs font-black shadow-sm">
                            {p.studentName.charAt(0)}
                          </div>
                          <span>{p.studentName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">
                          <div className="inline-flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-[#00A8FF]" />
                            <span>{p.class}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              p.category === 'Sub Junior'
                                ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                                : p.category === 'Junior'
                                ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                                : 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              p.gender === 'Boys'
                                ? 'bg-sky-950/50 text-sky-300 border border-sky-500/30'
                                : 'bg-pink-950/50 text-pink-300 border border-pink-500/30'
                            }`}
                          >
                            {p.gender}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#00A8FF]">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span>{p.competitionName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <AssignCompetitionCell
                            participant={p}
                            allPrograms={allPrograms}
                            onAssign={assignCompetitionToParticipant}
                            onRemove={removeCompetitionFromParticipant}
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
