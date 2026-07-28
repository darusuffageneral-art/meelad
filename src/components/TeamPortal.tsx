import React, { useState, useEffect } from 'react';
import { Participant, Team, Category, Gender, Program } from '../types';
import {
  subscribeParticipants,
  addParticipant,
  updateParticipant,
  assignCompetitionToParticipant,
  removeCompetitionFromParticipant
} from '../services/participantService';
import { subscribePrograms } from '../services/programService';
import { AssignCompetitionCell } from './AssignCompetitionCell';
import { ParticipantProfileModal } from './ParticipantProfileModal';
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
  Key,
  UserPlus,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePdfReport } from '../utils/pdfGenerator';
import { useSettings } from '../context/SettingsContext';

interface TeamPortalProps {
  team: string;
  teamId: 'Cairo' | 'Cordoba';
  onBack: () => void;
}

export const TeamPortal: React.FC<TeamPortalProps> = ({ team, teamId, onBack }) => {
  const settings = useSettings();
  const sessionKey = `team_unlocked_${teamId}`;
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(sessionKey) === 'true';
  });

  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);

  // Add Participant Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newClass, setNewClass] = useState<string>('Class 5');
  const [newCategory, setNewCategory] = useState<Category>('Sub Junior');
  const [newGender, setNewGender] = useState<Gender>('Boys');
  const [newPhone, setNewPhone] = useState<string>('');
  const [addingError, setAddingError] = useState<string>('');
  const [addingSuccess, setAddingSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Profile Modal State
  const [selectedProfileParticipant, setSelectedProfileParticipant] = useState<Participant | null>(null);

  // Edit Participant State
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editClass, setEditClass] = useState<string>('');
  const [editCategory, setEditCategory] = useState<Category>('Sub Junior');
  const [editGender, setEditGender] = useState<Gender>('Boys');

  // Accordion state
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedGender, setSelectedGender] = useState<Gender | 'All'>('All');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const defaultPassword = teamId === 'Cairo' ? 'cairo123' : 'cordoba123';

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    const trimmed = passwordInput.trim().toLowerCase();

    const validPasswords = [
      defaultPassword,
      teamId.toLowerCase(),
      `${teamId.toLowerCase()}2026`,
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

  useEffect(() => {
    if (!isUnlocked) return;
    setLoading(true);
    const unsubParticipants = subscribeParticipants('All', (data) => {
      // Filter for both exact dynamic team name AND legacy team id
      const filteredForTeam = data.filter(p => p.team === team || p.team === teamId);
      setParticipants(filteredForTeam);
      setLoading(false);
    });
    const unsubPrograms = subscribePrograms((progData) => {
      setAllPrograms(progData);
    });

    return () => {
      unsubParticipants();
      unsubPrograms();
    };
  }, [team, teamId, isUnlocked]);

  // Handle Add Participant (Team-specific)
  const handleAddParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingError('');
    setAddingSuccess('');

    if (!newName.trim()) {
      setAddingError('Please enter student name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addParticipant({
        studentName: newName.trim(),
        class: newClass.trim(),
        category: newCategory,
        gender: newGender,
        team: team, // Locked to current team
        assignedCompetitions: [],
        competitionName: ''
      });

      setAddingSuccess(`Participant "${newName.trim()}" added successfully to ${team}!`);
      setNewName('');
      setNewPhone('');
      setTimeout(() => {
        setShowAddModal(false);
        setAddingSuccess('');
      }, 1200);
    } catch (err) {
      setAddingError('Failed to add participant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (p: Participant) => {
    setEditingParticipant(p);
    setEditName(p.studentName);
    setEditClass(p.class);
    setEditCategory(p.category);
    setEditGender(p.gender);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;
    try {
      await updateParticipant(editingParticipant.id, {
        studentName: editName.trim(),
        class: editClass.trim(),
        category: editCategory,
        gender: editGender
      });
      setEditingParticipant(null);
    } catch (err) {
      alert('Failed to update participant.');
    }
  };

  // Extract unique competitions for dropdown filter
  const uniqueCompetitions = Array.from(
    new Set([
      ...allPrograms.map((pr) => pr.name),
      ...participants.flatMap((p) => p.assignedCompetitions || [p.competitionName]).filter(Boolean)
    ])
  ).filter(Boolean).sort();

  // Filter logic
  const filteredParticipants = participants.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
    if (selectedCompetition !== 'All') {
      const assigned = p.assignedCompetitions || (p.competitionName ? [p.competitionName] : []);
      if (!assigned.includes(selectedCompetition)) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.studentName.toLowerCase().includes(q);
      const matchClass = p.class.toLowerCase().includes(q);
      const assigned = p.assignedCompetitions || (p.competitionName ? [p.competitionName] : []);
      const matchComp = assigned.some((c) => c.toLowerCase().includes(q));
      if (!matchName && !matchClass && !matchComp) return false;
    }
    return true;
  });

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
      participants: filteredParticipants,
      appName: settings.appName
    });
  };

  // Locked Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-black px-4 py-12 text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#0057FF]/30 to-[#00A8FF]/20 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#001F3F]/50 border border-[#0057FF]/50 backdrop-blur-2xl shadow-2xl shadow-[#0057FF]/20 text-center"
        >
          <div className="flex justify-start mb-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>

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
            Enter the {team} team password to access the participant directory and registration.
          </p>

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

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#001F3F]/70 border border-[#0057FF]/30 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Default Access Pass:</span>
              <code className="font-mono font-bold text-[#00A8FF] bg-black/60 px-2 py-0.5 rounded border border-[#00A8FF]/30">
                {defaultPassword}
              </code>
            </div>

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
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0057FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#00A8FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
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
                  <span>{team} TEAM PORTAL</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Register participants & assign competitions for {team} team
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add Participant & PDF Report */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Participant</span>
            </button>

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
            <p className="text-2xl font-black text-sky-400 mt-0.5">{boysCount}</p>
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
            <span>Filter {team} Participant Roster</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Category</label>
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

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Gender</label>
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

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Competition</label>
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
        </div>

        {/* Participants Table / List */}
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
                ? `No students registered for ${team} yet. Click "+ Add Participant" above to register students.`
                : 'No participants match the selected filter criteria.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold uppercase tracking-wider"
            >
              + Register First Student
            </button>
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
                    <th className="py-3.5 px-4">Assigned Programs</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0057FF]/15">
                  <AnimatePresence>
                    {filteredParticipants.map((p, idx) => {
                      return (
                        <React.Fragment key={p.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className="hover:bg-[#0057FF]/10 transition-colors cursor-pointer"
                            onClick={() => setExpandedStudentId(expandedStudentId === p.id ? null : p.id)}
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
                            <td className="py-3.5 px-4">
                              <span className="text-[11px] font-bold text-slate-400">
                                {p.assignedCompetitions?.length || 0} Programs
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="p-1.5 rounded-lg bg-[#0057FF]/20 text-[#00A8FF] hover:bg-[#0057FF] hover:text-white transition-all cursor-pointer"
                                  title="Edit Student"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                          
                          <AnimatePresence>
                            {expandedStudentId === p.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-[#001F3F]/50"
                              >
                                <td colSpan={7} className="px-4 py-4">
                                  <div className="max-w-3xl mx-auto border border-[#0057FF]/20 rounded-2xl p-4 bg-black/40">
                                    <h4 className="text-[#00A8FF] text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Trophy className="w-4 h-4" />
                                      Assigned Competitions
                                    </h4>
                                    <AssignCompetitionCell
                                      participant={p}
                                      allPrograms={allPrograms}
                                      onAssign={assignCompetitionToParticipant}
                                      onRemove={removeCompetitionFromParticipant}
                                    />
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD PARTICIPANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[#001F3F] border border-[#0057FF]/60 rounded-3xl shadow-2xl overflow-hidden text-white relative"
          >
            <div className="p-6 bg-gradient-to-r from-[#001F3F] via-[#0057FF]/40 to-[#001F3F] border-b border-[#0057FF]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    Register New Student
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Team: {team} (Assigned automatically)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/70 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddParticipantSubmit} className="p-6 space-y-4">
              {addingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  {addingSuccess}
                </div>
              )}
              {addingError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                  {addingError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Student Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammed Ali"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Class</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-3 text-xs text-white focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Sub Junior">Sub Junior</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as Gender)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-[#0057FF]/30 text-[11px] text-slate-400">
                Note: Programs are assigned in the participant profile after registration. A participant can join any number of competitions.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-black/60 text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT PARTICIPANT MODAL */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#001F3F] border border-[#0057FF]/60 rounded-3xl shadow-2xl p-6 text-white relative"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#0057FF]/30">
              <h3 className="text-lg font-black uppercase text-white">Edit Student Details</h3>
              <button
                onClick={() => setEditingParticipant(null)}
                className="p-1.5 rounded-lg bg-black/40 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Student Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Class</label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-2 py-2 text-xs text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-2 py-2 text-xs text-white"
                  >
                    <option value="Sub Junior">Sub Junior</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as Gender)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-2 py-2 text-xs text-white"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-black/60 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0057FF] hover:bg-[#00A8FF] text-white text-xs font-bold uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* PARTICIPANT PROFILE MODAL */}
      {selectedProfileParticipant && (
        <ParticipantProfileModal
          participant={selectedProfileParticipant}
          allPrograms={allPrograms}
          onClose={() => setSelectedProfileParticipant(null)}
          onAssign={assignCompetitionToParticipant}
          onRemove={removeCompetitionFromParticipant}
        />
      )}
    </div>
  );
};
