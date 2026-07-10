import React, { useState, useEffect } from 'react';
import { Shield, Zap, Terminal, LogOut, LogIn, Crosshair, SignalHigh, HelpCircle } from 'lucide-react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Difficulty } from '../types';
import { motion } from 'motion/react';
import { Tooltip } from './Tooltip';

interface Props {
  onStart: (currentLevel: number, targetLevel: number, difficulty: Difficulty) => void;
}

export const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center space-y-12 overflow-y-auto terminal-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 pt-12"
      >
        <div className="flex items-center justify-center gap-3 text-emerald-400">
          <Terminal size={48} className="text-emerald-500" />
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-white">Syntax Hacker</h1>
        </div>
        <p className="text-emerald-500/60 uppercase tracking-[0.6em] text-[10px] font-bold">// TOPIK_TERMINAL_PROTOCOL_v4.0.0_STABLE</p>
      </motion.div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pb-12">
        
        {/* Left Column: Briefing & Settings */}
        <div className="border border-slate-700 p-8 bg-slate-900/30 space-y-8 text-left relative overflow-hidden flex flex-col">
           <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
           
           <div>
               <div className="flex items-center gap-2 text-white/80 mb-2">
                 <Shield className="w-4 h-4 text-emerald-500" />
                 <span className="text-xs font-bold uppercase tracking-[0.2em] font-mono">// INITIAL_MISSION_BRIEF</span>
               </div>
               <p className="text-sm leading-relaxed text-slate-300 font-mono mb-4">
                 AGENT, YOUR OBJECTIVE IS TO BYPASS THE LANGUAGE FIREWALLS PROTECTING THE K-NET CENTRAL CORE. 
                 YOU MUST DEPLOY PRECISE GRAMMATICAL STRUCTURES TO DECRYPT ENCRYPTED NODES.
               </p>
           </div>
           
           <div className="space-y-4">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                     <Zap className="w-3 h-3 text-amber-500" />
                     <span className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest">Gamification Modifiers:</span>
                 </div>
                 <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-wider font-mono">
                   Adjust the simulation difficulty. This affects starting health, credit yield, and tool costs, but does not change the linguistic level.
                 </p>
                 <div className="flex gap-2">
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                         <div key={d} className="flex-1 flex gap-1 items-center">
                            <button
                                onClick={() => setDifficulty(d)}
                                className={`flex-1 p-2 border font-bold text-[10px] uppercase transition-all ${
                                    difficulty === d 
                                    ? 'border-amber-500 bg-amber-500/20 text-amber-400' 
                                    : 'border-slate-700 hover:border-slate-500 text-slate-500'
                                }`}
                            >
                                {d}
                            </button>
                            <Tooltip 
                                content={
                                    d === 'EASY' ? "Initial: 1000 Credits, 50 HP. Rewards: 50% Yield." 
                                    : d === 'MEDIUM' ? "Initial: 100 Credits, 30 HP. Rewards: 100% Yield."
                                    : "Initial: 0 Credits, 20 HP. Rewards: 250% Yield. Hidden Translations."
                                }
                                position="top"
                            >
                                <div className="text-slate-500 hover:text-amber-400 cursor-help p-1">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                            </Tooltip>
                        </div>
                    ))}
                 </div>
               </div>
               
               <div className="pt-2">
                  <p className="text-[8px] text-slate-600 italic px-1">
                    {difficulty === 'EASY' ? ">> SIMPLIFIED_DECRYPT_ACTIVE. CREDIT_YIELD: 50%." 
                     : difficulty === 'MEDIUM' ? ">> STANDARD_DECRYPT_ACTIVE. CREDIT_YIELD: 100%."
                     : ">> TRANSLATION_LAYER BYPASSED. CREDIT_YIELD: 250%. DANGER: CRITICAL."}
                  </p>
               </div>
           </div>

            <div className="border border-slate-800 p-4 bg-slate-900/50 flex flex-col items-center justify-center space-y-4 mt-auto">
                {user ? (
                    <div className="text-center space-y-2 w-full">
                        <div className="text-[10px] text-emerald-500 uppercase tracking-widest">// IDENTITY_VERIFIED</div>
                        <div className="text-xs text-white break-all">{user.email}</div>
                        <button onClick={handleLogout} className="text-[10px] text-red-400 hover:text-red-300 uppercase flex items-center justify-center gap-1 w-full p-2 border border-red-500/30 hover:bg-red-500/10 transition-colors mt-2">
                            <LogOut className="w-3 h-3"/> SEVER_CONNECTION
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-3 w-full">
                        <div className="text-[10px] text-amber-500 uppercase tracking-widest">// IDENTITY_UNKNOWN</div>
                        <p className="text-[10px] text-slate-400">PROGRESS WILL NOT BE SAVED TO CENTRAL DATABANKS.</p>
                        <button onClick={handleLogin} className="w-full text-xs text-emerald-400 hover:text-white uppercase flex items-center justify-center gap-2 p-3 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors">
                            <LogIn className="w-4 h-4"/> AUTHENTICATE_SIG
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Level Selection */}
        <div className="border border-slate-700 p-8 bg-slate-950/80 space-y-8 flex flex-col justify-center">
            
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <SignalHigh className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">// CURRENT_PROFICIENCY</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest font-mono text-center">
                        Select your current estimated TOPIK level. This sets the baseline for initial nodes.
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <button
                                key={level}
                                onClick={() => {
                                    setCurrentLevel(level);
                                    if (targetLevel < level) setTargetLevel(level);
                                }}
                                className={`h-12 border transition-all text-lg font-black ${
                                    currentLevel === level
                                    ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'border-slate-800 bg-slate-900/50 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-400'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <Crosshair className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">// TARGET_CLEARANCE</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest font-mono text-center">
                        Select the TOPIK level you aim to achieve. Must be equal to or higher than your current proficiency.
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <button
                                key={level}
                                disabled={level < currentLevel}
                                onClick={() => setTargetLevel(level)}
                                className={`h-12 border transition-all text-lg font-black ${
                                    level < currentLevel ? 'opacity-30 border-slate-900 bg-slate-950 text-slate-800 cursor-not-allowed' :
                                    targetLevel === level
                                    ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                    : 'border-slate-800 bg-slate-900/50 text-slate-600 hover:border-purple-500/50 hover:text-purple-400'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8">
                <button
                    onClick={() => onStart(currentLevel, targetLevel, difficulty)}
                    className="w-full relative group h-16 border border-emerald-500 bg-emerald-950/30 hover:bg-emerald-500/20 transition-all overflow-hidden flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_2s_linear_infinite]" />
                    <span className="relative z-10 text-emerald-400 font-bold uppercase tracking-[0.4em] group-hover:text-white transition-colors flex items-center gap-2">
                        INITIATE_CONNECTION <Zap className="w-4 h-4" />
                    </span>
                </button>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono text-center mt-4">
                    // ESTABLISHING SECURE CONNECTION TO TOPIK_LIBS... //
                </p>
            </div>

        </div>
      </div>

    </div>
  );
};
