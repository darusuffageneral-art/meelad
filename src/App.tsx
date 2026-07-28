import React, { useState } from 'react';
import { ViewMode } from './types';
import { Header } from './components/Header';
import { HeroLanding } from './components/HeroLanding';
import { TeamPortal } from './components/TeamPortal';
import { AdminPortal } from './components/AdminPortal';
import { NamedStagePortal } from './components/NamedStagePortal';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from './context/SettingsContext';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const settings = useSettings();

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-[#0057FF] selection:text-white flex flex-col antialiased overflow-x-hidden w-full">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
      />

      {/* View Switcher with Motion Fade */}
      <main className="flex-1 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroLanding onNavigate={handleNavigate} />
            </motion.div>
          )}

          {currentView === 'stage' && (
            <motion.div
              key="stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <NamedStagePortal
                onBack={() => handleNavigate('landing')}
                isAdminLoggedIn={isAdminLoggedIn}
              />
            </motion.div>
          )}

          {currentView === 'team_a' && (
            <motion.div
              key="team_a"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TeamPortal team={settings.teamAName} teamId="Cairo" onBack={() => handleNavigate('landing')} />
            </motion.div>
          )}

          {currentView === 'team_b' && (
            <motion.div
              key="team_b"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TeamPortal team={settings.teamBName} teamId="Cordoba" onBack={() => handleNavigate('landing')} />
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AdminPortal
                isLoggedIn={isAdminLoggedIn}
                onLoginSuccess={handleAdminLoginSuccess}
                onLogout={handleAdminLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-[#0057FF]/20 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-400">
            {settings.appName.toUpperCase()} &copy; {new Date().getFullYear()} — All Rights Reserved
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#00A8FF]/70">
            <span>Powered by Firebase Firestore</span>
            <span>•</span>
            <span>Realtime Team Synchronization</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
