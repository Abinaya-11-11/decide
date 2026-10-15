import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Smartphone, Monitor, Compass, Zap, History } from 'lucide-react';
import { ViewMode } from '../types/decision';
import { soundFx } from '../utils/audio';

interface MobileContainerProps {
  children: React.ReactNode;
  activeTab: ViewMode;
  onTabChange: (tab: ViewMode) => void;
  decisionCount: number;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  activeTab,
  onTabChange,
  decisionCount,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.muted);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const updated = soundFx.toggleMute();
    setIsMuted(updated);
  };

  return (
    <div className="min-h-screen w-full bg-[#03060c] text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      {/* Top Utility Control Bar on Desktop/Tablet */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-2 text-xs font-mono-numbers text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-slate-300">DECISION ENGINE ACTIVE</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Toggle Device Frame"
          >
            {deviceFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>EXPAND</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>MOBILE SHELL</span>
              </>
            )}
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-400 hover:text-indigo-300'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Shell / Container */}
      <div
        className={`w-full relative flex flex-col transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-[430px] min-h-[760px] max-h-[92vh] sm:rounded-[44px] sm:border-[9px] sm:border-slate-800/90 shadow-[0_0_60px_rgba(0,0,0,0.8),0_20px_40px_rgba(15,23,42,0.6)] bg-gradient-to-b from-[#060a14] via-[#040710] to-[#03050a] overflow-hidden'
            : 'w-full max-w-xl min-h-screen bg-[#03060c]'
        }`}
      >
        {/* Mobile Header / Notch / Status Bar */}
        <div className="w-full shrink-0 pt-3 pb-2 px-6 flex items-center justify-between text-xs font-mono-numbers text-slate-400 border-b border-slate-900/60 bg-slate-950/40 backdrop-blur-md z-30">
          <span className="font-extrabold tracking-wider text-slate-300">
            {currentTime || '09:41'}
          </span>

          {/* Dynamic Island / Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800/80 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] uppercase font-mono-numbers tracking-widest text-indigo-300 font-bold">
              DECIDENOW
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="sm:hidden text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] font-bold text-slate-400">100%</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-600 p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile App Body */}
        <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col justify-start pb-24 relative">
          {children}
        </main>

        {/* Tactile Bottom Tab Bar */}
        <nav className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 py-2.5 px-4 flex items-center justify-around z-30">
          <button
            onClick={() => {
              soundFx.playTick();
              onTabChange('decide');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === 'decide'
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-mono-numbers font-bold uppercase tracking-wider">
              DECIDE
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playTick();
              onTabChange('triage');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === 'triage'
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-mono-numbers font-bold uppercase tracking-wider">
              FAST FLIP
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playTick();
              onTabChange('history');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all relative ${
              activeTab === 'history'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-mono-numbers font-bold uppercase tracking-wider">
              LOG
            </span>
            {decisionCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-mono-numbers text-white font-bold flex items-center justify-center">
                {decisionCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};
