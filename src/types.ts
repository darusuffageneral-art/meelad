export type Category = 'Sub Junior' | 'Junior' | 'Senior';
export type Gender = 'Boys' | 'Girls';
export type Team = string; // Using string to allow dynamic team names

export interface Participant {
  id: string;
  studentName: string;
  class: string;
  category: Category;
  gender: Gender;
  competitionName: string;
  assignedCompetitions?: string[];
  team: Team;
  codeLetter?: string;
  photoUrl?: string;
  registrationNumber?: string;
  attendanceStatus?: 'Present' | 'Pending';
  arrivedAt?: string;
  createdAt: string;
}

export type ViewMode = 'landing' | 'team_a' | 'team_b' | 'admin' | 'stage';

export interface Program {
  id?: string;
  name: string;
  category?: Category | 'All';
  gender?: Gender | 'All';
  codePrefix?: string;
  createdAt?: string;
}

export interface FilterOptions {
  category: Category | 'All';
  gender: Gender | 'All';
  competition: string;
  searchQuery: string;
}
