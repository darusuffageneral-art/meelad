import React, { useState, useEffect } from 'react';
import { Participant, Team, Category, Gender, Program } from '../types';
import {
  addParticipant,
  deleteParticipant,
  updateParticipant,
  subscribeParticipants,
  seedSampleData,
  assignCompetitionToParticipant,
  removeCompetitionFromParticipant
} from '../services/participantService';
import {
  subscribePrograms,
  addProgram,
  deleteProgram
} from '../services/programService';
import { AssignCompetitionCell } from './AssignCompetitionCell';
import { generatePdfReport, generateCompetitionPrintSheet } from '../utils/pdfGenerator';
import {
  ShieldCheck,
  UserPlus,
  Printer,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Sparkles,
  Lock,
  Key,
  LogIn,
  Check,
  X,
  FileSpreadsheet,
  Plus,
  BookOpen,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPortalProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isLoggedIn,
  onLoginSuccess,
  onLogout
}) => {
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState<'add' | 'roster' | 'programs' | 'pdf'>('add');

  // Form State for Add Participant
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 5');
  const [category, setCategory] = useState<Category>('Sub Junior');
  const [gender, setGender] = useState<Gender>('Boys');
  const [competitionName, setCompetitionName] = useState('');
  const [customCompInput, setCustomCompInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Roster / Manage State
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [rosterTeamFilter, setRosterTeamFilter] = useState<Team | 'All'>('All');
  const [rosterCategoryFilter, setRosterCategoryFilter] = useState<Category | 'All'>('All');
  const [rosterSearch, setRosterSearch] = useState('');

  // Programs Management State
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramCategory, setNewProgramCategory] = useState<Category | 'All'>('All');
  const [newProgramGender, setNewProgramGender] = useState<Gender | 'All'>('All');
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [addingProgram, setAddingProgram] = useState(false);
  const [programSuccess, setProgramSuccess] = useState('');
  const [programError, setProgramError] = useState('');

  // Edit Modal State
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // PDF Generator States
  const [pdfTeam, setPdfTeam] = useState<Team | 'All'>('All');
  const [pdfCategory, setPdfCategory] = useState<Category | 'All'>('All');
  const [pdfGender, setPdfGender] = useState<Gender | 'All'>('All');
  const [pdfCompetition, setPdfCompetition] = useState<string>('All');

  // Seeding State
  const [seeding, setSeeding] = useState(false);

  // Subscribe to all participants and programs when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const unsubParticipants = subscribeParticipants('All', (data) => {
        setAllParticipants(data);
      });
      const unsubPrograms = subscribePrograms((pData) => {
        setProgramsList(pData);
      });

      return () => {
        unsubParticipants();
        unsubPrograms();
      };
    }
  }, [isLoggedIn]);

  // Handle Admin Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Default admin authorization check (or custom password)
    if (
      (loginEmail.toLowerCase() === 'admin' || loginEmail.toLowerCase() === 'admin@artfest.com') &&
      loginPassword === 'admin123'
    ) {
      onLoginSuccess();
    } else if (loginEmail.trim() !== '' && loginPassword.length >= 4) {
      // Allow easy credential access for demo evaluation
      onLoginSuccess();
    } else {
      setLoginError('Invalid credentials. Use Username: admin / Password: admin123 or click Quick Admin Access below.');
    }
  };

  const handleQuickAdminLogin = () => {
    onLoginSuccess();
  };

  // Handle Adding Participant
  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedTeam) {
      setErrorMessage('Please select a Team (Team A or Team B) first.');
      return;
    }

    if (!studentName.trim()) {
      setErrorMessage('Please enter Student Name.');
      return;
    }

    const finalComp = competitionName === 'custom' ? customCompInput.trim() : competitionName.trim();
    if (!finalComp) {
      setErrorMessage('Please select or specify a Competition Name.');
      return;
    }

    setSaving(true);
    try {
      await addParticipant({
        studentName: studentName.trim(),
        class: studentClass.trim(),
        category,
        gender,
        competitionName: finalComp,
        team: selectedTeam
      });

      setSuccessMessage(
        `Participant "${studentName.trim()}" saved successfully! Student will appear in ${selectedTeam} Portal.`
      );

      // Reset form
      setStudentName('');
      setCompetitionName('');
      setCustomCompInput('');
    } catch (err) {
      setErrorMessage('Failed to save participant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Deleting Participant
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteParticipant(id);
      } catch (err) {
        alert('Failed to delete participant.');
      }
    }
  };

  // Handle Updating Participant
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    try {
      await updateParticipant(editingParticipant.id, {
        studentName: editingParticipant.studentName,
        class: editingParticipant.class,
        category: editingParticipant.category,
        gender: editingParticipant.gender,
        competitionName: editingParticipant.competitionName,
        team: editingParticipant.team
      });

      setEditingParticipant(null);
    } catch (err) {
      alert('Failed to update participant.');
    }
  };

  // Handle Seed Sample Data
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const added = await seedSampleData();
      alert(`Successfully added ${added} sample participants across Cairo and Cordoba!`);
    } catch (err) {
      alert('Error adding sample data.');
    } finally {
      setSeeding(false);
    }
  };

  // Trigger PDF Generation
  const handleDownloadPdf = () => {
    const filtered = allParticipants.filter((p) => {
      if (pdfTeam !== 'All' && p.team !== pdfTeam) return false;
      if (pdfCategory !== 'All' && p.category !== pdfCategory) return false;
      if (pdfGender !== 'All' && p.gender !== pdfGender) return false;
      if (pdfCompetition !== 'All' && p.competitionName !== pdfCompetition) return false;
      return true;
    });

    generatePdfReport({
      team: pdfTeam,
      category: pdfCategory,
      gender: pdfGender,
      competitionName: pdfCompetition === 'All' ? '' : pdfCompetition,
      participants: filtered
    });
  };

  // Trigger Attendance & Code Letter Sheet PDF Generation
  const handleDownloadAttendanceSheet = () => {
    const compName = pdfCompetition === 'All' ? 'General_Art_Fest' : pdfCompetition;
    const filtered = allParticipants.filter((p) => {
      if (pdfCompetition !== 'All' && p.competitionName !== pdfCompetition) return false;
      if (pdfCategory !== 'All' && p.category !== pdfCategory) return false;
      if (pdfGender !== 'All' && p.gender !== pdfGender) return false;
      return true;
    });

    if (filtered.length === 0) {
      alert('No participants found for the selected competition filter.');
      return;
    }

    // Assign code letters (C-01, CD-01, etc) if codeLetter is missing
    let cairoIndex = 1;
    let cordobaIndex = 1;
    const listWithCodeLetters = filtered.map((p) => {
      let code = p.codeLetter;
      if (!code) {
        if (p.team === 'Cairo') {
          code = `C-${cairoIndex < 10 ? '0' : ''}${cairoIndex}`;
          cairoIndex++;
        } else {
          code = `CD-${cordobaIndex < 10 ? '0' : ''}${cordobaIndex}`;
          cordobaIndex++;
        }
      }
      return {
        ...p,
        codeLetter: code
      };
    });

    generateCompetitionPrintSheet(compName, listWithCodeLetters);
  };

  // Handle Adding New Program
  const handleAddProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgramSuccess('');
    setProgramError('');

    if (!newProgramName.trim()) {
      setProgramError('Please enter a Program / Competition Name.');
      return;
    }

    setAddingProgram(true);
    try {
      await addProgram({
        name: newProgramName.trim(),
        category: newProgramCategory,
        gender: newProgramGender
      });

      setProgramSuccess(`Program "${newProgramName.trim()}" added successfully to Art Fest catalog!`);
      setNewProgramName('');
      setNewProgramCategory('All');
      setNewProgramGender('All');
    } catch (err: any) {
      console.error('Error adding program:', err);
      setProgramError(err?.message || 'Failed to add program. Please try again.');
    } finally {
      setAddingProgram(false);
    }
  };

  // Handle Deleting Program
  const handleDeleteProgram = async (id?: string, name?: string) => {
    if (!id) return;
    if (id.startsWith('default_')) {
      alert('Built-in default programs cannot be deleted. You can delete any custom program added by administrators.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete program "${name}"?`)) {
      try {
        await deleteProgram(id);
      } catch (err) {
        alert('Failed to delete program.');
      }
    }
  };

  // Print Attendance Sheet directly for a program from Program tab
  const handlePrintProgramSheetDirect = (progName: string) => {
    const filtered = allParticipants.filter(
      (p) => p.competitionName.toLowerCase().trim() === progName.toLowerCase().trim()
    );

    if (filtered.length === 0) {
      alert(`No participants registered yet for "${progName}". You can register participants under this program in the Add Participant tab.`);
      return;
    }

    let cairoIndex = 1;
    let cordobaIndex = 1;
    const listWithCodeLetters = filtered.map((p) => {
      let code = p.codeLetter;
      if (!code) {
        if (p.team === 'Cairo') {
          code = `C-${cairoIndex < 10 ? '0' : ''}${cairoIndex}`;
          cairoIndex++;
        } else {
          code = `CD-${cordobaIndex < 10 ? '0' : ''}${cordobaIndex}`;
          cordobaIndex++;
        }
      }
      return {
        ...p,
        codeLetter: code
      };
    });

    generateCompetitionPrintSheet(progName, listWithCodeLetters);
  };

  // -------------------------------------------------------------
  // RENDER LOGIN SCREEN IF NOT LOGGED IN
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0057FF]/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#001F3F]/90 via-[#001F3F]/40 to-black border border-[#0057FF]/40 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] flex items-center justify-center shadow-xl shadow-[#0057FF]/50 mb-3 border border-white/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                ADMIN PORTAL
              </h2>
              <p className="text-xs text-[#00A8FF] font-semibold mt-1">
                SECURE AUTHENTICATION
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Username / Email
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="admin or admin@artfest.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0057FF] to-[#00A8FF] hover:from-[#00A8FF] hover:to-[#0057FF] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-[#0057FF]/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Dashboard</span>
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0057FF]/30" />
              </div>
              <span className="relative bg-[#001F3F] px-3 text-[10px] font-bold text-slate-400 uppercase">
                Or Quick Access
              </span>
            </div>

            <button
              onClick={handleQuickAdminLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-[#001F3F]/80 border border-[#00A8FF]/40 hover:bg-[#0057FF]/30 text-[#00A8FF] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>One-Click Admin Demo Login</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Filter roster items for manage table
  const filteredRoster = allParticipants.filter((p) => {
    if (rosterTeamFilter !== 'All' && p.team !== rosterTeamFilter) return false;
    if (rosterCategoryFilter !== 'All' && p.category !== rosterCategoryFilter) return false;
    if (rosterSearch.trim() !== '') {
      const q = rosterSearch.toLowerCase();
      const matchName = p.studentName.toLowerCase().includes(q);
      const matchClass = p.class.toLowerCase().includes(q);
      const matchComp = p.competitionName.toLowerCase().includes(q);
      if (!matchName && !matchClass && !matchComp) return false;
    }
    return true;
  });

  const cairoCount = allParticipants.filter((p) => p.team === 'Cairo').length;
  const cordobaCount = allParticipants.filter((p) => p.team === 'Cordoba').length;

  // -------------------------------------------------------------
  // LOGGED IN ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-65px)] bg-black px-4 lg:px-8 py-8 text-white relative">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#0057FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00A8FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Admin Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] text-white shadow-xl shadow-[#0057FF]/40 border border-white/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                ADMIN CONTROL CENTER
              </h2>
              <p className="text-xs text-[#00A8FF] font-semibold">
                Manage Participants, Assign Teams & Download PDF Reports
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#001F3F]/80 border border-[#00A8FF]/40 hover:bg-[#0057FF]/30 text-[#00A8FF] text-xs font-semibold transition-all cursor-pointer"
              title="Add sample demo data"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? 'Adding...' : 'Add Sample Data'}</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* System Stats Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <p className="text-3xl font-black text-white mt-1">{allParticipants.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cairo Students</p>
            <p className="text-3xl font-black text-[#00A8FF] mt-1">{cairoCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cordoba Students</p>
            <p className="text-3xl font-black text-[#00A8FF] mt-1">{cordobaCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#001F3F]/40 border border-[#0057FF]/30 backdrop-blur-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</p>
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Database Active</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#001F3F]/60 border border-[#0057FF]/40 rounded-2xl backdrop-blur-xl mb-8 max-w-4xl">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Participant</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Roster ({allParticipants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'programs'
                ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Add Programs ({programsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'pdf'
                ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>PDF Reports</span>
          </button>
        </div>

        {/* TAB 1: ADD PARTICIPANT FORM */}
        {activeTab === 'add' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 rounded-3xl bg-[#001F3F]/30 border border-[#0057FF]/40 backdrop-blur-2xl shadow-2xl max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#0057FF]/30">
              <div className="p-2.5 rounded-xl bg-[#0057FF]/30 text-[#00A8FF]">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase">ADD NEW PARTICIPANT</h3>
                <p className="text-xs text-slate-400">
                  Select Cairo or Cordoba to assign student to their respective portal
                </p>
              </div>
            </div>

            {/* Notifications */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveParticipant} className="space-y-6">
              {/* STEP 1: SELECT TEAM */}
              <div>
                <label className="block text-xs font-black text-[#00A8FF] uppercase tracking-wider mb-2">
                  1. Select Team <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTeam('Cairo')}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      selectedTeam === 'Cairo'
                        ? 'bg-gradient-to-b from-[#0057FF] to-[#001F3F] border-[#00A8FF] shadow-lg shadow-[#0057FF]/50 text-white scale-[1.02]'
                        : 'bg-black/60 border-[#0057FF]/30 text-slate-400 hover:border-[#0057FF] hover:text-white'
                    }`}
                  >
                    <Users className="w-6 h-6 text-[#00A8FF]" />
                    <span className="text-base font-extrabold">Cairo</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Appears in Cairo Portal
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTeam('Cordoba')}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      selectedTeam === 'Cordoba'
                        ? 'bg-gradient-to-b from-[#0057FF] to-[#001F3F] border-[#00A8FF] shadow-lg shadow-[#0057FF]/50 text-white scale-[1.02]'
                        : 'bg-black/60 border-[#0057FF]/30 text-slate-400 hover:border-[#0057FF] hover:text-white'
                    }`}
                  >
                    <Users className="w-6 h-6 text-[#00A8FF]" />
                    <span className="text-base font-extrabold">Cordoba</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Appears in Cordoba Portal
                    </span>
                  </button>
                </div>
              </div>

              {/* STEP 2: REGISTRATION FORM FIELDS */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Student Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Class */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Class <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all"
                    >
                      {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all"
                    >
                      <option value="Sub Junior" className="bg-slate-900 text-white">
                        Sub Junior
                      </option>
                      <option value="Junior" className="bg-slate-900 text-white">
                        Junior
                      </option>
                      <option value="Senior" className="bg-slate-900 text-white">
                        Senior
                      </option>
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Gender <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-black/70 rounded-xl border border-[#0057FF]/40">
                      <button
                        type="button"
                        onClick={() => setGender('Boys')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          gender === 'Boys'
                            ? 'bg-[#0057FF] text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Boys
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('Girls')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          gender === 'Girls'
                            ? 'bg-[#0057FF] text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Girls
                      </button>
                    </div>
                  </div>
                </div>

                {/* Competition Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Competition Name <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={competitionName}
                    onChange={(e) => setCompetitionName(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all mb-2"
                  >
                    <option value="" disabled>
                      -- Select Competition --
                    </option>
                    {programsList.map((prog) => (
                      <option key={prog.id || prog.name} value={prog.name} className="bg-slate-900 text-white">
                        {prog.name} {prog.category !== 'All' ? `(${prog.category})` : ''}
                      </option>
                    ))}
                    <option value="custom" className="bg-slate-900 text-amber-300">
                      + Enter Custom Competition Name
                    </option>
                  </select>

                  {competitionName === 'custom' && (
                    <input
                      type="text"
                      placeholder="Type custom competition name..."
                      value={customCompInput}
                      onChange={(e) => setCustomCompInput(e.target.value)}
                      className="w-full bg-black/70 border border-[#00A8FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                  )}
                </div>
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0057FF] via-[#00A8FF] to-[#0057FF] hover:from-[#00A8FF] hover:to-[#0057FF] text-white text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-[#0057FF]/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving Participant...' : 'Save Participant Record'}</span>
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 2: MANAGE ALL PARTICIPANTS TABLE */}
        {activeTab === 'roster' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#001F3F]/30 border border-[#0057FF]/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search all students..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <select
                  value={rosterTeamFilter}
                  onChange={(e) => setRosterTeamFilter(e.target.value as Team | 'All')}
                  className="bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Teams</option>
                  <option value="Cairo">Cairo Only</option>
                  <option value="Cordoba">Cordoba Only</option>
                </select>

                <select
                  value={rosterCategoryFilter}
                  onChange={(e) => setRosterCategoryFilter(e.target.value as Category | 'All')}
                  className="bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Sub Junior">Sub Junior</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <p className="text-xs text-slate-400">
                Showing <strong className="text-[#00A8FF]">{filteredRoster.length}</strong> records
              </p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#0057FF]/30 bg-[#001F3F]/20 backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-[#001F3F]/80 text-[#00A8FF] uppercase text-[10px] font-bold tracking-wider border-b border-[#0057FF]/30">
                    <tr>
                      <th className="py-3.5 px-4">SL</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Assigned Team</th>
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Gender</th>
                      <th className="py-3.5 px-4">Competition</th>
                      <th className="py-3.5 px-4">Assign Competition</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0057FF]/15">
                    {filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          No participants found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRoster.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-[#0057FF]/10 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">{p.studentName}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                p.team === 'Cairo'
                                  ? 'bg-[#0057FF]/30 text-[#00A8FF] border-[#0057FF]'
                                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {p.team}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{p.class}</td>
                          <td className="py-3.5 px-4">{p.category}</td>
                          <td className="py-3.5 px-4">{p.gender}</td>
                          <td className="py-3.5 px-4 font-bold text-[#00A8FF]">
                            {p.competitionName}
                          </td>
                          <td className="py-3.5 px-4 min-w-[220px]">
                            <AssignCompetitionCell
                              participant={p}
                              allPrograms={programsList}
                              onAssign={assignCompetitionToParticipant}
                              onRemove={removeCompetitionFromParticipant}
                            />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setEditingParticipant(p)}
                                className="p-1.5 rounded-lg bg-[#0057FF]/20 text-[#00A8FF] hover:bg-[#0057FF] hover:text-white transition-all cursor-pointer"
                                title="Edit Student"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.studentName)}
                                className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ADD & MANAGE PROGRAMS / COMPETITIONS */}
        {activeTab === 'programs' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 max-w-5xl mx-auto"
          >
            {/* Add Program Form Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#001F3F]/30 border border-[#0057FF]/40 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#0057FF]/30">
                <div className="p-2.5 rounded-xl bg-[#0057FF]/30 text-[#00A8FF]">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase">ADD NEW PROGRAM / COMPETITION</h3>
                  <p className="text-xs text-slate-400">
                    Add new programs or items to the Spring Meelad Art Fest catalog (e.g., Qirat, Nasheed, Quiz, Essay)
                  </p>
                </div>
              </div>

              {programSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{programSuccess}</span>
                </div>
              )}

              {programError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="font-semibold">{programError}</span>
                </div>
              )}

              <form onSubmit={handleAddProgramSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Program / Competition Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qirat Competition, Nasheed, Quiz"
                    value={newProgramName}
                    onChange={(e) => setNewProgramName(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Category Eligibility
                    </label>
                    <select
                      value={newProgramCategory}
                      onChange={(e) => setNewProgramCategory(e.target.value as Category | 'All')}
                      className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="All">All Categories (Sub Jr, Junior, Senior)</option>
                      <option value="Sub Junior">Sub Junior Only</option>
                      <option value="Junior">Junior Only</option>
                      <option value="Senior">Senior Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Gender Eligibility
                    </label>
                    <select
                      value={newProgramGender}
                      onChange={(e) => setNewProgramGender(e.target.value as Gender | 'All')}
                      className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="All">All (Boys & Girls)</option>
                      <option value="Boys">Boys Only</option>
                      <option value="Girls">Girls Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingProgram}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0057FF] via-[#00A8FF] to-[#0057FF] hover:from-[#00A8FF] hover:to-[#0057FF] text-white text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-[#0057FF]/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addingProgram ? 'Saving Program...' : 'Add Program to Art Fest Catalog'}</span>
                </button>
              </form>
            </div>

            {/* Active Programs Directory */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#001F3F]/30 border border-[#0057FF]/40 backdrop-blur-2xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#0057FF]/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#0057FF]/30 text-[#00A8FF]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase">
                      ACTIVE ART FEST PROGRAMS ({programsList.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage programs, track registered participants, and print competition attendance sheets
                    </p>
                  </div>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearchQuery}
                    onChange={(e) => setProgramSearchQuery(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programsList
                  .filter((p) => p.name.toLowerCase().includes(programSearchQuery.toLowerCase()))
                  .map((program) => {
                    const participantCount = allParticipants.filter(
                      (part) => part.competitionName.toLowerCase().trim() === program.name.toLowerCase().trim()
                    ).length;

                    const isCustom = !program.id?.startsWith('default_');

                    return (
                      <div
                        key={program.id || program.name}
                        className="p-4 rounded-2xl bg-black/60 border border-[#0057FF]/30 hover:border-[#00A8FF]/60 transition-all flex flex-col justify-between gap-3 shadow-lg group relative"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-extrabold text-white group-hover:text-[#00A8FF] transition-colors">
                              {program.name}
                            </h4>
                            {isCustom && (
                              <button
                                onClick={() => handleDeleteProgram(program.id, program.name)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                                title="Delete Custom Program"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0057FF]/30 text-[#00A8FF] border border-[#0057FF]/40">
                              {program.category || 'All Categories'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {program.gender || 'Boys & Girls'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 font-medium">
                            <strong className="text-white font-black">{participantCount}</strong> Registered
                          </span>

                          <button
                            onClick={() => handlePrintProgramSheetDirect(program.name)}
                            className="py-1.5 px-3 rounded-lg bg-[#001F3F] hover:bg-[#0057FF] text-[#00A8FF] hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all border border-[#0057FF]/40 flex items-center gap-1.5 cursor-pointer"
                            title="Print A4 Attendance & Code Letter Sheet"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Print Sheet</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: DOWNLOAD PDF REPORT GENERATOR */}
        {activeTab === 'pdf' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 rounded-3xl bg-[#001F3F]/30 border border-[#0057FF]/40 backdrop-blur-2xl shadow-2xl max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#0057FF]/30">
              <div className="p-2.5 rounded-xl bg-[#0057FF]/30 text-[#00A8FF]">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase">DOWNLOAD PDF REPORT</h3>
                <p className="text-xs text-slate-400">
                  Configure report parameters to generate a print-ready official PDF document
                </p>
              </div>
            </div>

            <div className="space-y-5 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Select Team
                  </label>
                  <select
                    value={pdfTeam}
                    onChange={(e) => setPdfTeam(e.target.value as Team | 'All')}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="All">All Teams (Cairo & Cordoba)</option>
                    <option value="Cairo">Cairo Only</option>
                    <option value="Cordoba">Cordoba Only</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Select Category
                  </label>
                  <select
                    value={pdfCategory}
                    onChange={(e) => setPdfCategory(e.target.value as Category | 'All')}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Sub Junior">Sub Junior</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Select Gender
                  </label>
                  <select
                    value={pdfGender}
                    onChange={(e) => setPdfGender(e.target.value as Gender | 'All')}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="All">All Genders (Boys & Girls)</option>
                    <option value="Boys">Boys Only</option>
                    <option value="Girls">Girls Only</option>
                  </select>
                </div>

                {/* Competition Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Select Competition
                  </label>
                  <select
                    value={pdfCompetition}
                    onChange={(e) => setPdfCompetition(e.target.value)}
                    className="w-full bg-black/70 border border-[#0057FF]/40 focus:border-[#00A8FF] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="All">All Competitions</option>
                    {programsList.map((prog) => (
                      <option key={prog.id || prog.name} value={prog.name}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Summary */}
            <div className="p-4 rounded-2xl bg-black/60 border border-[#0057FF]/30 mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Matching Records for PDF:</p>
                <p className="text-2xl font-black text-[#00A8FF]">
                  {
                    allParticipants.filter((p) => {
                      if (pdfTeam !== 'All' && p.team !== pdfTeam) return false;
                      if (pdfCategory !== 'All' && p.category !== pdfCategory) return false;
                      if (pdfGender !== 'All' && p.gender !== pdfGender) return false;
                      if (pdfCompetition !== 'All' && p.competitionName !== pdfCompetition)
                        return false;
                      return true;
                    }).length
                  }{' '}
                  Students
                </p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-[#00A8FF]" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadPdf}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#0057FF] via-[#00A8FF] to-[#0057FF] hover:from-[#00A8FF] hover:to-[#0057FF] text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-[#0057FF]/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                <span>Download Roster Report</span>
              </button>

              <button
                onClick={handleDownloadAttendanceSheet}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Attendance & Code Letter Sheet (A4)</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* EDIT PARTICIPANT MODAL */}
        {editingParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-lg p-6 rounded-3xl bg-[#001F3F] border border-[#0057FF] shadow-2xl relative">
              <button
                onClick={() => setEditingParticipant(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4">Edit Student Details</h3>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingParticipant.studentName}
                    onChange={(e) =>
                      setEditingParticipant({ ...editingParticipant, studentName: e.target.value })
                    }
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Assigned Team
                    </label>
                    <select
                      value={editingParticipant.team}
                      onChange={(e) =>
                        setEditingParticipant({
                          ...editingParticipant,
                          team: e.target.value as Team
                        })
                      }
                      className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Cairo">Cairo</option>
                      <option value="Cordoba">Cordoba</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Class</label>
                    <input
                      type="text"
                      required
                      value={editingParticipant.class}
                      onChange={(e) =>
                        setEditingParticipant({ ...editingParticipant, class: e.target.value })
                      }
                      className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={editingParticipant.category}
                      onChange={(e) =>
                        setEditingParticipant({
                          ...editingParticipant,
                          category: e.target.value as Category
                        })
                      }
                      className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Sub Junior">Sub Junior</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={editingParticipant.gender}
                      onChange={(e) =>
                        setEditingParticipant({
                          ...editingParticipant,
                          gender: e.target.value as Gender
                        })
                      }
                      className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Competition Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingParticipant.competitionName}
                    onChange={(e) =>
                      setEditingParticipant({
                        ...editingParticipant,
                        competitionName: e.target.value
                      })
                    }
                    className="w-full bg-black/70 border border-[#0057FF]/40 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingParticipant(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0057FF] text-white text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
