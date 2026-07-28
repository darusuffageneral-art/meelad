import React, { useState } from 'react';
import { ViewMode } from '../types';
import { Home, Users, Shield, LogOut, Lock, UserCheck, Menu, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  onAdminLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settings = useSettings();

  const handleNav = (view: ViewMode) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-[#0057FF]/30 px-3 sm:px-4 lg:px-8 py-2.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Title */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-3 group text-left focus:outline-none shrink"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-xs font-bold text-[#00A8FF] tracking-widest uppercase">
                KAMMUSUFI SUNI CENTRE MADRASA
              </span>
            </div>
            <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wider text-white group-hover:text-[#00A8FF] transition-colors uppercase leading-snug">
              {settings.appName}
            </h1>
            <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-300 font-semibold tracking-widest flex items-center gap-1">
              <span className="text-[#00A8FF] font-bold">THEYYOTTUCHIRA</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-normal">OFFICIAL PORTAL</span>
            </p>
          </div>
        </button>

        {/* Desktop Navigation Actions */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          {currentView !== 'landing' && (
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-slate-300 bg-[#001F3F]/60 border border-[#0057FF]/40 hover:bg-[#0057FF]/20 hover:text-white transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#00A8FF]" />
              <span>Home</span>
            </button>
          )}

          {/* Portal Navigation Pills */}
          <div className="flex items-center gap-1 bg-[#001F3F]/40 p-1 rounded-xl border border-[#0057FF]/30">
            <button
              onClick={() => handleNav('stage')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'stage'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                  : 'text-amber-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Stage</span>
            </button>

            <button
              onClick={() => handleNav('team_a')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'team_a'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3 text-[#00A8FF] shrink-0" />
              <span>{settings.teamAName}</span>
            </button>

            <button
              onClick={() => handleNav('team_b')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'team_b'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3 text-[#00A8FF] shrink-0" />
              <span>{settings.teamBName}</span>
            </button>

            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              Admin
            </button>
          </div>

          {/* Admin Logout button if logged in */}
          {isAdminLoggedIn && currentView === 'admin' && (
            <button
              onClick={onAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/60 transition-all cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-[#001F3F]/80 border border-[#0057FF]/40 text-[#00A8FF] hover:bg-[#0057FF]/20 focus:outline-none transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#0057FF]/30 flex flex-col gap-2">
          {currentView !== 'landing' && (
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-[#001F3F]/60 border border-[#0057FF]/30 hover:bg-[#0057FF]/30 transition-all text-left"
            >
              <Home className="w-4 h-4 text-[#00A8FF]" />
              <span>Home Landing</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNav('stage')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'stage'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40 border border-[#00A8FF]'
                  : 'bg-[#001F3F]/60 text-amber-300 border border-amber-500/30'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Stage Portal</span>
            </button>

            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40 border border-[#00A8FF]'
                  : 'bg-[#001F3F]/60 text-slate-300 border border-[#0057FF]/30'
              }`}
            >
              <Shield className="w-4 h-4 text-[#00A8FF]" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => handleNav('team_a')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'team_a'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40 border border-[#00A8FF]'
                  : 'bg-[#001F3F]/60 text-sky-300 border border-sky-500/30'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>{settings.teamAName} Team</span>
            </button>

            <button
              onClick={() => handleNav('team_b')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'team_b'
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00A8FF] text-white shadow-lg shadow-[#0057FF]/40 border border-[#00A8FF]'
                  : 'bg-[#001F3F]/60 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{settings.teamBName} Team</span>
            </button>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() => {
                onAdminLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/40 mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Admin</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
