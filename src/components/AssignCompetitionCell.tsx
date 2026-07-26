import React, { useState } from 'react';
import { Participant, Program } from '../types';
import { Trophy, Plus, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { PlusCircle } from 'lucide-react';

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
    const categoryMatch = !p.category || p.category === 'All' || p.category === participant.category;
    // Gender match
    const genderMatch = !p.gender || p.gender === 'All' || p.gender === participant.gender;

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
      <div className="flex flex-wrap items-center gap-1.5">
        {assignedList.length === 0 ? (
          <span className="text-[11px] text-slate-500 italic">No competition assigned</span>
        ) : (
          assignedList.map((comp) => (
            <span
              key={comp}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0057FF]/25 border border-[#00A8FF]/40 text-[#00A8FF] text-[11px] font-bold shadow-sm"
            >
              <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{comp}</span>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveClick(comp)}
                  disabled={loading}
                  className="ml-1 text-slate-400 hover:text-rose-400 cursor-pointer p-0.5 rounded hover:bg-rose-950/40 transition-colors"
                  title="Remove this assigned competition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
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
