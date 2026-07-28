import React, { useState } from 'react';
import { Participant, Program } from '../types';
import { X, Trophy, Plus, BookOpen, Users, UserCheck, Shield, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ParticipantProfileModalProps {
  participant: Participant;
  allPrograms: Program[];
  onClose: () => void;
  onAssign: (participant: Participant, competitionName: string) => Promise<void>;
  onRemove: (participant: Participant, competitionName: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const ParticipantProfileModal: React.FC<ParticipantProfileModalProps> = ({
  participant,
  allPrograms,
  onClose,
  onAssign,
  onRemove,
  isReadOnly = false
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedComp, setSelectedComp] = useState('');

  const assignedList = Array.from(
    new Set<string>(
      Array.isArray(participant.assignedCompetitions) && participant.assignedCompetitions.length > 0
        ? participant.assignedCompetitions
        : participant.competitionName
        ? [participant.competitionName]
        : []
    )
  );

  // Filter programs matching category & gender eligibility
  const availablePrograms = allPrograms.filter((p) => {
    const categoryMatch = !p.category || p.category === 'All' || p.category === participant.category;
    const genderMatch = !p.gender || p.gender === 'All' || p.gender === participant.gender;
    return categoryMatch && genderMatch;
  });

  const handleAddCompetition = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val || assignedList.includes(val)) return;

    setLoading(true);
    try {
      await onAssign(participant, val);
    } catch (err) {
      console.error('Failed to assign program:', err);
    } finally {
      setLoading(false);
      setSelectedComp('');
    }
  };

  const handleRemoveCompetition = async (compName: string) => {
    if (isReadOnly) return;
    setLoading(true);
    try {
      await onRemove(participant, compName);
    } catch (err) {
      console.error('Failed to remove program:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl bg-[#001F3F] border border-[#0057FF]/60 rounded-3xl shadow-2xl overflow-hidden text-white relative"
      >
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-[#001F3F] via-[#0057FF]/40 to-[#001F3F] border-b border-[#0057FF]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0057FF] to-[#00A8FF] flex items-center justify-center font-black text-xl shadow-lg border border-white/20">
              {participant.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                {participant.studentName}
              </h3>
              <p className="text-xs text-[#00A8FF] font-semibold">
                Participant Profile & Assigned Programs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/70 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Student Info Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/55 border border-[#0057FF]/30">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Class</p>
              <p className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#00A8FF]" />
                {participant.class}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                {participant.category}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                {participant.gender}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Team</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#0057FF]/30 text-[#00A8FF] border border-[#0057FF]">
                {participant.team}
              </span>
            </div>
          </div>

          {/* Assigned Programs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#00A8FF] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Assigned Programs ({assignedList.length})</span>
              </h4>
              {loading && <Loader2 className="w-4 h-4 text-[#00A8FF] animate-spin" />}
            </div>

            {/* List of Assigned Competitions */}
            <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-black/40 border border-[#0057FF]/30 min-h-[70px]">
              {assignedList.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-4 text-center">
                  <AlertCircle className="w-6 h-6 text-slate-500 mb-1" />
                  <p className="text-xs text-slate-400 italic">No competitions assigned yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Use the dropdown below to assign programs.</p>
                </div>
              ) : (
                assignedList.map((comp, idx) => (
                  <div
                    key={comp}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0057FF]/30 to-[#00A8FF]/20 border border-[#00A8FF]/40 text-white text-xs font-bold shadow-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#0057FF] text-white flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </span>
                    <span>{comp}</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveCompetition(comp)}
                        disabled={loading}
                        className="p-1 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove competition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* + Add Program Selector */}
            {!isReadOnly && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  + Add Competition / Program
                </label>
                <select
                  value={selectedComp}
                  onChange={handleAddCompetition}
                  disabled={loading}
                  className="w-full bg-black/70 border border-[#0057FF]/50 hover:border-[#00A8FF] focus:border-[#00A8FF] rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="">-- Select competition to assign --</option>
                  {availablePrograms.map((prog) => {
                    const isAssigned = assignedList.includes(prog.name);
                    return (
                      <option
                        key={prog.id || prog.name}
                        value={prog.name}
                        disabled={isAssigned}
                        className="bg-slate-900 text-white disabled:text-slate-500"
                      >
                        {prog.name} {isAssigned ? ' (Already Assigned ✓)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-[#0057FF]/30 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#0057FF] hover:bg-[#00A8FF] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
