import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const LEVEL_DESCRIPTIONS: Record<number, { title: string, subtitle: string, milestones: string[] }> = {
    1: {
        title: "LEVEL 1",
        subtitle: "Survival Competence",
        milestones: [
            "Active retrieval of ~800 core foundational words",
            "Functional execution of simple SOV declarative & interrogative structures",
            "Basic transactional conversations (café, retail, directions)"
        ]
    },
    2: {
        title: "LEVEL 2",
        subtitle: "Functional Routine Competence",
        milestones: [
            "Expanded active vocabulary of 1,500-2,000 words",
            "Multi-step interactions at public facilities (banks, post offices)",
            "Paragraph-level comprehension via sequential/causal conjunctive clauses",
            "Fluid alternation between formal and polite informal speech registers"
        ]
    },
    3: {
        title: "LEVEL 3",
        subtitle: "Functional Intermediate",
        milestones: [
            "Comprehension of abstract Sino-Korean vocabulary (Hanja derivatives)",
            "Clear distinction between colloquial and formal written registers",
            "Construction of objective descriptive paragraphs on familiar social themes"
        ]
    },
    4: {
        title: "LEVEL 4",
        subtitle: "Upper-Intermediate",
        milestones: [
            "Comprehension of general news broadcasts and societal columns",
            "Decoding of widely used idiomatic expressions and foundational proverbs",
            "Expression of nuanced personal perspectives on abstract/social themes"
        ]
    },
    5: {
        title: "LEVEL 5",
        subtitle: "Professional Advanced",
        milestones: [
            "Navigation of unfamiliar, highly abstract macroeconomic/geopolitical themes",
            "Absolute command over contextual shifting (official vs unofficial, literary vs colloquial)",
            "Crafting rigorous, 700-word structured argumentative essays"
        ]
    },
    6: {
        title: "LEVEL 6",
        subtitle: "Near-Native Exceptional Mastery",
        milestones: [
            "Seamless processing of highly technical, academic, or legal discourse",
            "Intuitive comprehension of complex four-character Sino-Korean idioms (사자성어)",
            "Flawless real-time rhetoric and rhetorically sophisticated output"
        ]
    }
};

interface UserLevelProgress {
    [level: number]: { [type: string]: number };
}

import { SkillTree } from './SkillTree';
import { UserStats } from '../types';

export const ProfileSection: React.FC<{ 
    onClose: () => void, 
    currentLevel: number, 
    onLevelBypass?: (lvl: number) => void,
    stats: UserStats,
    onUnlockSkill: (id: string) => void
}> = ({ onClose, currentLevel, onLevelBypass, stats, onUnlockSkill }) => {
    const [allQuestions, setAllQuestions] = useState<any[]>([]);
    const [masteredIds, setMasteredIds] = useState<string[]>([]);
    const [learnedItems, setLearnedItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const questionsRes = await fetch('/api/all-questions');
                const allQuestions = await questionsRes.json();
                setAllQuestions(allQuestions);
            } catch (e) {
                console.error("Failed to load questions", e);
            }
        };
        fetchBaseData();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setMasteredIds([]);
                setLearnedItems([]);
                return;
            }

            try {
                // Fetch User Progress
                const progressSnapshot = await getDocs(query(collection(db, 'userProgress'), where('userId', '==', user.uid)));
                const mastered: string[] = [];
                progressSnapshot.forEach((doc: any) => {
                   if (doc.data().correctCount >= 2) mastered.push(doc.data().questionId.toString());
                });
                setMasteredIds(mastered);

                // Fetch Learned Items
                const learnedSnapshot = await getDocs(query(collection(db, 'learnedItems'), where('userId', '==', user.uid)));
                const learned: any[] = [];
                learnedSnapshot.forEach((doc: any) => learned.push(doc.data()));
                learned.sort((a, b) => new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime());
                setLearnedItems(learned.slice(0, 5));
            } catch (e) {
                console.error(e);
            }
        });

        return () => unsubscribe();
    }, []);

    const calculateProgress = (level: number) => {
        const total = allQuestions.filter(q => q.level === level).length;
        const masteredInLevel = allQuestions
            .filter(q => q.level === level && masteredIds.includes(q.id))
            .length;
        return total === 0 ? 0 : Math.round((masteredInLevel / total) * 100);
    };

    const pendingItems = allQuestions.filter(q => q.level === currentLevel && !masteredIds.includes(q.id)).slice(0, 5);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 font-mono overflow-y-auto">
            <div className="w-full max-w-6xl bg-slate-950 border border-emerald-500 p-8 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b border-emerald-500/30 pb-4 shrink-0">
                    <h2 className="text-3xl text-emerald-400 uppercase tracking-widest">// COMPREHENSIVE_DIAGNOSTIC_RECORD</h2>
                    <button onClick={onClose}><X className="text-white hover:text-emerald-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 flex gap-8">
                    {/* Left Column: Ladder / Progress */}
                    <div className="w-1/2 space-y-6">
                        <h3 className="text-emerald-500 font-bold mb-4">// PROFICIENCY_TRAJECTORY</h3>
                        {[...Array(6)].map((_, i) => {
                            const l = i + 1;
                            const desc = LEVEL_DESCRIPTIONS[l];
                            const progress = calculateProgress(l);
                            const isActive = l === currentLevel;
                            const isPassed = l < currentLevel;

                            return (
                                <div key={l} className={`border p-4 ${isActive ? 'border-emerald-400 bg-emerald-900/20' : isPassed ? 'border-emerald-800 bg-slate-900/50' : 'border-slate-800 bg-slate-900/30 opacity-60'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`font-bold ${isActive || isPassed ? 'text-white' : 'text-slate-500'}`}>{desc.title}: {desc.subtitle}</span>
                                            {l <= 2 && <span className="ml-2 text-[10px] bg-slate-800 px-1 text-slate-400">TOPIK I</span>}
                                            {l > 2 && <span className="ml-2 text-[10px] bg-slate-800 px-1 text-slate-400">TOPIK II</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {onLevelBypass && !isActive && (
                                                <button onClick={() => onLevelBypass(l)} className="text-[10px] uppercase border border-amber-500/50 text-amber-500/80 hover:bg-amber-500 hover:text-black px-1.5 py-0.5 transition-colors font-bold">
                                                    // OVERRIDE
                                                </button>
                                            )}
                                            <span className="text-emerald-400 text-xs font-mono">{progress}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <ul className="space-y-1 mt-2">
                                        {desc.milestones.map((m, idx) => (
                                            <li key={idx} className={`text-[10px] font-mono leading-tight ${isActive || isPassed ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {isPassed ? <span className="text-emerald-500 mr-1">✓</span> : <span className="text-slate-600 mr-1">-</span>}
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Right Column: Detailed diagnostics */}
                    <div className="w-1/2 flex flex-col gap-6">
                        <div className="border border-emerald-500/30 bg-slate-900/50 p-6">
                            <h3 className="text-emerald-500 font-bold mb-2">// CURRENT_DIAGNOSTIC_STATE (LVL {currentLevel})</h3>
                            <p className="text-sm text-slate-300 mb-4">{LEVEL_DESCRIPTIONS[currentLevel].subtitle} - In Progress</p>
                            <div className="space-y-6">
                                <div>
                                     <h4 className="text-xs text-white font-bold border-b border-slate-700 pb-1 mb-3">PENDING_CORE_COMPETENCIES</h4>
                                     {pendingItems.length === 0 ? <p className="text-slate-500 text-xs">// Structural requirements met for this tier.</p> :
                                        <ul className="space-y-3">
                                            {pendingItems.map((item) => (
                                                <li key={item.id} className="text-[10px] text-slate-300 font-mono flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">!</span>
                                                    <span>
                                                        <strong className="text-white uppercase">[{item.type}]</strong> {item.prompt} 
                                                        <br/>
                                                        <span className="text-slate-500 italic">{item.translation}</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                     }
                                </div>
                                
                                 <div>
                                    <h4 className="text-xs text-emerald-400 font-bold border-b border-emerald-900 pb-1 mb-3">PROFICIENCY_DIAGNOSTICS</h4>
                                    <div className="space-y-4">
                                        {Object.entries(stats.proficiency)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 8)
                                            .map(([area, count]) => (
                                                <div key={area} className="space-y-1">
                                                    <div className="flex justify-between text-[9px] uppercase tracking-tighter">
                                                        <span className="text-slate-400">{area}</span>
                                                        <span className="text-emerald-500 font-bold">{count} NODES</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800/50 h-1 border border-slate-700/50">
                                                        <div 
                                                            className="h-full bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                                                            style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {Object.keys(stats.proficiency).length === 0 && (
                                            <p className="text-slate-500 text-[10px] italic font-mono">// NO SIGNAL TRACES FOUND.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-emerald-900/40 pt-4">
                                    <h4 className="text-xs text-amber-500 font-bold border-b border-amber-900/40 pb-1 mb-3 uppercase tracking-widest">Active_Mission_Objective</h4>
                                    {stats.currentMission ? (
                                        <div className="p-3 bg-amber-500/5 border border-amber-500/20">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] text-amber-500/80 font-black">{stats.currentMission.description}</span>
                                                <span className="text-[10px] text-amber-500 font-mono italic">{stats.currentMission.reward} CR</span>
                                            </div>
                                            <div className="w-full bg-slate-900 h-1.5 border border-amber-900/30 overflow-hidden">
                                                <div 
                                                    className="h-full bg-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all duration-500" 
                                                    style={{ width: `${(stats.currentMission.progress / stats.currentMission.goal) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[8px] text-amber-500/40 uppercase">Synchronization_Progress</span>
                                                <span className="text-[8px] text-amber-500 font-bold">{stats.currentMission.progress} / {stats.currentMission.goal}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-[10px] italic font-mono">// INITIALIZING MISSION PARAMETERS...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border border-emerald-900/30 bg-slate-900/30 p-6 flex-1">
                            <SkillTree stats={stats} onUnlock={onUnlockSkill} />
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-emerald-500/30 mt-4 shrink-0">
                    <button onClick={onClose} className="w-full p-3 border border-emerald-500 text-emerald-400 uppercase hover:bg-emerald-500/10 transition-colors font-bold tracking-widest">INITIATE_EXIT</button>
                </div>
            </div>
        </div>
    );
};
