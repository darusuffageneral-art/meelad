import React, { useState } from 'react';
import { Participant, Program } from '../types';
import { Trophy, X, AlertCircle, Loader2 } from 'lucide-react';

interface AssignCompetitionCellProps {
  participant: Participant;
  allPrograms: Program[];
  onAssign: (participant: Participant, competitionName: string) => Promise<void>;
  onRemove: (participant: Participant, competitionName: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const AssignCompetitionCell: React.FC<AssignCompetitionCellProps> = ({
  participant,
  allPrograms,
  onAssign,
  onRemove,
  isReadOnly = false
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedComp, setSelectedComp] = useState<string>('');

  // Normalize assigned competitions list
  const assignedList: string[] = Array.from(
    new Set<string>(
      Array.isArray(participant.assignedCompetitions) && participant.assignedCompetitions.length > 0
        ? participant.assignedCompetitions
        : participant.competitionName
        ? [participant.competitionName]
        : []
    )
  );

  // Filter competitions matching student's exact category & gender eligibility
  const availablePrograms = allPrograms.filter((p) => {
    // Category match
    const pCat = (p.category || 'All').trim().toLowerCase();
    const partCat = (participant.category || '').trim().toLowerCase();
    const categoryMatch = pCat === 'all' || pCat === partCat;

    // Gender match
    const pGen = (p.gender || 'All').trim().toLowerCase();
    const partGen = (participant.gender || '').trim().toLowerCase();
    const genderMatch = pGen === 'all' || pGen === partGen;

    return categoryMatch && genderMatch;
  });

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    if (assignedList.includes(value)) {
      setSelectedComp('');
      return;
    }

    setLoading(true);
    try {
      await onAssign(participant, value);
    } catch (err) {
      console.error('Failed to assign competition:', err);
    } finally {
      setLoading(false);
      setSelectedComp('');
    }
  };

  const handleRemoveClick = async (compName: string) => {
    if (isReadOnly) return;
    setLoading(true);
    try {
      await onRemove(participant, compName);
    } catch (err) {
      console.error('Failed to remove competition:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 py-1">
      {/* List of Assigned Badges */}
      <div className="flex flex-col gap-2">
        {assignedList.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic px-2 py-1">No competition assigned</div>
        ) : (
          assignedList.map((comp, idx) => (
            <div
              key={comp}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#001F3F] to-transparent border-l-2 border-[#00A8FF] shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0057FF]/20 flex items-center justify-center font-mono text-[10px] text-[#00A8FF] font-bold">
                  {idx + 1}
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-white tracking-wide">{comp}</span>
                </div>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveClick(comp)}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove this assigned competition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Assign Competition Dropdown Selector */}
      {!isReadOnly && (
        <div className="flex items-center gap-2">
          {availablePrograms.length === 0 ? (
            <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>No competitions available for this category.</span>
            </div>
          ) : (
            <div className="relative inline-block w-full max-w-[200px]">
              <select
                value={selectedComp}
                onChange={handleSelectChange}
                disabled={loading}
                className="w-full bg-black/80 border border-[#0057FF]/40 hover:border-[#00A8FF] focus:border-[#00A8FF] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-white focus:outline-none transition-all cursor-pointer shadow-sm"
              >
                <option value="">+ Assign Competition...</option>
                {availablePrograms.map((prog) => {
                  const isAssigned = assignedList.includes(prog.name);
                  return (
                    <option
                      key={prog.id || prog.name}
                      value={prog.name}
                      disabled={isAssigned}
                      className="bg-slate-900 text-white disabled:text-slate-500"
                    >
                      {prog.name} {isAssigned ? '(Assigned ✓)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {loading && <Loader2 className="w-3.5 h-3.5 text-[#00A8FF] animate-spin shrink-0" />}
        </div>
      )}
    </div>
  );
};
