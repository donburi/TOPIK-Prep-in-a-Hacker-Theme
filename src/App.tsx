import React, { useState, useEffect, useCallback } from 'react';
import { GameState, UserStats, Encounter, TerminalLog, Difficulty, MissionObjective } from './types';
import { StatusBar } from './components/StatusBar';
import { EncounterPane } from './components/EncounterPane';
import { SyntaxStack } from './components/SyntaxStack';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TerminalFeed } from './components/TerminalFeed';
import { DataArchive } from './components/DataArchive';
import { WritingModule } from './components/WritingModule';
import { ProfileSection } from './components/ProfileSection';
import { StartScreen } from './components/StartScreen';
import { MissionNotification } from './components/MissionNotification';
import { ChatBot } from './components/ChatBot';
import { Tooltip } from './components/Tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_STATS: UserStats = {
  hp: 30,
  maxHp: 30,
  credits: 0,
  currentLevel: 1,
  targetLevel: 3,
  difficulty: 'MEDIUM',
  missionProgress: 0,
  missionGoal: 5,
  missionsCleared: 0,
  unlockedSkills: [],
  proficiency: {},
  streak: 0,
  lastActiveDate: '',
};

const generateMission = (level: number, missionsCleared: number): MissionObjective => {
  const missionPool: { type: 'FOCUS' | 'DOMAIN' | 'GENERAL', target?: string, description: string, goal: number }[] = [
    { type: 'GENERAL', description: 'Synchronize any 5 data nodes', goal: 5 },
    { type: 'DOMAIN', target: 'grammar', description: 'Decrypt 3 syntax patterns', goal: 3 },
    { type: 'DOMAIN', target: 'vocabulary', description: 'Harvest 3 lexical units', goal: 3 },
    { type: 'FOCUS', target: 'Topic Particle', description: 'Calibrate 2 Topic Particles', goal: 2 },
    { type: 'FOCUS', target: 'Subject Particle', description: 'Calibrate 2 Subject Particles', goal: 2 },
    { type: 'FOCUS', target: 'Action Location Particle', description: 'Calibrate 2 Action Location Particles', goal: 2 },
    { type: 'FOCUS', target: 'Static Location Particle', description: 'Calibrate 3 Static Location Particles', goal: 3 },
    { type: 'FOCUS', target: 'Conjunction Particle', description: 'Calibrate 2 Conjunction Particles', goal: 2 },
  ];

  if (level >= 3) {
    missionPool.push(
      { type: 'FOCUS', target: 'Contrast', description: 'Analyze 2 Contrast structures', goal: 2 },
      { type: 'FOCUS', target: 'Reason / Suggestion', description: 'Analyze 3 Reason/Suggestion markers', goal: 3 },
      { type: 'FOCUS', target: 'Sequential Action', description: 'Decrypt 3 Sequential flows', goal: 3 },
    );
  }

  // Select a mission randomly
  const base = missionPool[Math.floor(Math.random() * missionPool.length)];
  
  return {
    id: `m_${Date.now()}`,
    ...base,
    progress: 0,
    reward: level * 500 + (missionsCleared * 100)
  };
};

import { SKILL_TREE } from './constants/skills';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('INIT');
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ success: boolean; difficulty: number }[]>([]);
  const [translationRevealed, setTranslationRevealed] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [showArchive, setShowArchive] = useState(false);
  const [showWriting, setShowWriting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMissionClear, setShowMissionClear] = useState(false);
  const [playMode, setPlayMode] = useState<'syntax'|'vocab'>('syntax');
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<'success' | 'failure' | null>(null);
  const [activeModifier, setActiveModifier] = useState<'CRITICAL_INSIGHT' | 'SIGNAL_BOOST' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return unsubscribe;
  }, []);

  // Sync state to Firestore with debounce
  useEffect(() => {
    if (!user || isResuming) return;

    const saveTimer = setTimeout(async () => {
        const path = `users/${user.uid}/gameState/current`;
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const dataToSave = {
                
                stats,
                gameState,
                encounter,
                logs,
                history,
                playMode,
                masteredIds,
                recentQuestionIds,
                lastSaved: new Date().toISOString()
            };
            
            // Remove undefined values recursively
            const removeUndefined = (obj) => {
                if (Array.isArray(obj)) {
                    return obj.filter(v => v !== undefined).map(removeUndefined);
                } else if (obj !== null && typeof obj === 'object') {
                    return Object.fromEntries(
                        Object.entries(obj)
                            .filter(([_, v]) => v !== undefined)
                            .map(([k, v]) => [k, removeUndefined(v)])
                    );
                }
                return obj;
            };

            await setDoc(doc(db, path), removeUndefined(dataToSave));
        } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, path);
        }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [user, stats, gameState, encounter, logs, history, playMode, masteredIds, recentQuestionIds, isResuming]);

  // Load state from Firestore on start
  useEffect(() => {
    const loadState = async () => {
        if (!user) return;
        setIsResuming(true);
        const path = `users/${user.uid}/gameState/current`;
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const snap = await getDoc(doc(db, path));
            
            if (snap.exists()) {
                const data = snap.data();
                const loadedStats = data.stats || INITIAL_STATS;

                const today = new Date().toISOString().split('T')[0];
                let newStreak = loadedStats.streak || 0;
                let lastActive = loadedStats.lastActiveDate || '';

                if (lastActive !== today) {
                  if (lastActive) {
                    const lastActiveTime = new Date(lastActive).getTime();
                    const todayTime = new Date(today).getTime();
                    const diffDays = Math.floor((todayTime - lastActiveTime) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                      newStreak += 1;
                    } else if (diffDays > 1) {
                      newStreak = 1;
                    }
                  } else {
                    newStreak = 1;
                  }
                  lastActive = today;
                }

                setStats({
                    ...INITIAL_STATS,
                    ...loadedStats,
                    streak: newStreak,
                    lastActiveDate: lastActive,
                    proficiency: loadedStats.proficiency || {},
                    currentMission: loadedStats.currentMission || generateMission(loadedStats.currentLevel || 1, loadedStats.missionsCleared || 0)
                });
                setGameState(data.gameState);
                setEncounter(data.encounter);
                setLogs(data.logs || []);
                setHistory(data.history || []);
                setPlayMode(data.playMode || 'syntax');
                setMasteredIds(data.masteredIds || []);
                setRecentQuestionIds(data.recentQuestionIds || []);
                addLog('PREVIOUS_SESSION_RESTORED. WELCOME BACK, OPERATOR.', 'SYSTEM');
            } else {
                const today = new Date().toISOString().split('T')[0];
                setStats({
                    ...INITIAL_STATS,
                    streak: 1,
                    lastActiveDate: today
                });
            }
        } catch (e) {
            handleFirestoreError(e, OperationType.GET, path);
        } finally {
            setIsResuming(false);
        }
    };
    loadState();
  }, [user]);

  // Fetch mastered questions on startup (complementary to the state load)
  useEffect(() => {
    const fetchMastered = async () => {
        if (!user) {
            setMasteredIds([]);
            return;
        }
        const progressPath = 'userProgress';
        try {
            const { collection, getDocs, query, where } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const q = query(collection(db, progressPath), where('userId', '==', user.uid), where('correctCount', '>=', 2));
            const snapshot = await getDocs(q);
            const ids = snapshot.docs.map(d => d.data().questionId);
            setMasteredIds(ids.map(id => id.toString()));
        } catch (e) {
            handleFirestoreError(e, OperationType.LIST, progressPath);
        }
    };
    fetchMastered();
  }, [user]);

  const addLog = useCallback((text: string, type: 'INFO' | 'SUCCESS' | 'ERROR' | 'SYSTEM' = 'INFO', metadata?: any) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { id: Math.random().toString(36), text, type, timestamp, metadata }]);
  }, []);

  const fetchEncounter = useCallback(async (level: number, mode: 'syntax'|'vocab' = playMode) => {
    setLoading(true);
    setTranslationRevealed(false);
    setRevealedCards(new Set());
    setActiveModifier(null);
    addLog(`Connecting to NODE_LEVEL_${level}...`, 'SYSTEM');
    
    try {
      const response = await fetch('/api/encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLevel: level, mode, excludeId: encounter ? encounter.id : undefined, masteredIds, recentQuestionIds }),
      });
      const data = await response.json();
      setEncounter(data);
      addLog(`BYPASS SUCCESSFUL. NODE_TYPE: ${data.type?.toUpperCase() || 'UNKNOWN'}. STANDBY FOR DECRYPT.`, 'SUCCESS');
    } catch (error) {
      addLog('CONNECTION INTERRUPTED. FIREWALL SECURED.', 'ERROR');
    } finally {
      setLoading(false);
      setSelectedCardId(null);
    }
  }, [addLog, playMode, encounter, masteredIds, recentQuestionIds]);

  // Handle play mode change during gameplay
  const handlePlayModeChange = (newMode: 'syntax'|'vocab') => {
      setPlayMode(newMode);
      if (gameState === 'PLAYING') {
          fetchEncounter(stats.currentLevel, newMode);
      }
  };

  const handleStart = (currentLevel: number, targetLevel: number, difficulty: Difficulty) => {
    let hp = 30;
    let goal = 5;
    let credits = 100;
    if (difficulty === 'EASY') {
        hp = 50;
        goal = 3;
        credits = 1000;
    }
    if (difficulty === 'HARD') {
        hp = 20;
        goal = 8;
        credits = 0;
    }

    setStats({ 
        ...INITIAL_STATS, 
        targetLevel,
        currentLevel,
        difficulty, 
        hp, 
        maxHp: hp, 
        credits,
        missionGoal: goal,
        currentMission: generateMission(currentLevel, 0)
    });
    setGameState('PLAYING');
    addLog('PROTOCOL INITIALIZED. WELCOME, OPERATOR.', 'SYSTEM');
    if (difficulty === 'HARD') {
      addLog('CRITICAL: TRANSLATION_LAYER BYPASSED. OVERLOAD DETECTED.', 'ERROR');
    }
    fetchEncounter(currentLevel, playMode);
  };

  const handleUnlockSkill = (skillId: string) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill || stats.credits < skill.cost || stats.unlockedSkills.includes(skillId)) return;

    setStats(prev => {
        const nextStats = {
            ...prev,
            credits: prev.credits - skill.cost,
            unlockedSkills: [...prev.unlockedSkills, skillId]
        };

        // Immediate application for some skills
        if (skill.effect.type === 'MAX_HP') {
            nextStats.maxHp += skill.effect.value;
            nextStats.hp += skill.effect.value;
        }

        return nextStats;
    });

    addLog(`NEURAL_UPGRADE_ACQUIRED: ${skill.name}.`, 'SUCCESS');
  };

  const handleExecute = async () => {
    if (selectedCardId === null || !encounter) return;

    setLoading(true);
    setEvaluationResult(null);
    addLog(`EXECUTING COMMAND: STACK_ID_${selectedCardId}...`, 'INFO');
    
    const selectedText = encounter.cards.find(c => c.id === selectedCardId)?.text;
    const correctText = encounter.cards[encounter.correct_answer_id].text;

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userInput: selectedText, 
          prompt: encounter.prompt, 
          correctAnswer: correctText 
        }),
      });
      const result = await response.json();

      if (result.is_correct) {
        setEvaluationResult('success');
        // removed
        addLog(`[DECRYPT_SUCCESS] COMPLETED DECRYPTION FOR SEGMENT: "${encounter.prompt.replace(/(?:___|_ _ _|\(\s*㉠\s*\))/i, '[  ]')}"`, 'SUCCESS');
        addLog(`SELECTED TRANSLATION: "${selectedText}"`, 'SUCCESS');
        if (result.terminal_log) {
          addLog(`FEEDBACK: ${result.terminal_log}`, 'SUCCESS');
        }
        
        // Proficiency tracking
        const focus = encounter.metadata?.focus || 'General';
        const domain = encounter.type || 'unknown';

        setStats(prev => {
            const nextProficiency = { ...prev.proficiency };
            nextProficiency[focus] = (nextProficiency[focus] || 0) + 1;
            nextProficiency[domain] = (nextProficiency[domain] || 0) + 1;

            let nextMission = prev.currentMission ? { ...prev.currentMission } : undefined;
            let missionCompleted = false;

            if (nextMission) {
                let progressed = false;
                if (nextMission.type === 'GENERAL') progressed = true;
                if (nextMission.type === 'DOMAIN' && nextMission.target === domain) progressed = true;
                if (nextMission.type === 'FOCUS' && nextMission.target === focus) progressed = true;

                if (progressed) {
                    nextMission.progress += 1;
                    if (nextMission.progress >= nextMission.goal) {
                        missionCompleted = true;
                    }
                }
            }

            return {
                ...prev,
                proficiency: nextProficiency,
                currentMission: nextMission
            };
        });

        // Save progress to Firestore
        if (encounter && user) {
            const progressPath = `userProgress/${user.uid}_${encounter.id}`;
            const learnedPath = 'learnedItems';
            try {
                const { collection, doc, getDoc, setDoc, increment, addDoc } = await import('firebase/firestore');
                const { db } = await import('./firebase');
                const questionRef = doc(db, 'userProgress', `${user.uid}_${encounter.id}`);
                const questionSnap = await getDoc(questionRef);
                
                let newCount = 1;
                if (questionSnap.exists()) {
                    newCount = questionSnap.data().correctCount + 1;
                    await setDoc(questionRef, { correctCount: increment(1), lastAnswered: new Date().toISOString() }, { merge: true });
                } else {
                    await setDoc(questionRef, { userId: user.uid, questionId: encounter.id, correctCount: 1, lastAnswered: new Date().toISOString() });
                }
                
                if (newCount >= 1 && !masteredIds.includes(encounter.id.toString())) {
                    setMasteredIds(prev => [...prev, encounter.id.toString()]);
                }
                
                // Track recent questions
                setRecentQuestionIds(prev => {
                    const newRecent = [...prev.filter(id => id !== encounter.id.toString()), encounter.id.toString()];
                    return newRecent.slice(-10);
                });

                await addDoc(collection(db, learnedPath), {
                    userId: user.uid,
                    text: encounter.prompt || '', 
                    translation: encounter.translation || '', 
                    classification: encounter.type || 'unknown', 
                    type: 'reading',
                    learnedAt: new Date().toISOString()
                });
            } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, progressPath);
            }
        }
        
        let baseCredits = stats.currentLevel * 100;
        let multiplier = 1;
        if (stats.difficulty === 'EASY') multiplier = 0.5;
        if (stats.difficulty === 'HARD') multiplier = 2.5;
        
        // Skill: Neural Optimization (Credit Boost)
        const creditBoost = SKILL_TREE
            .filter(s => stats.unlockedSkills.includes(s.id) && s.effect.type === 'CREDIT_BOOST')
            .reduce((acc, s) => acc + s.effect.value, 0);
        multiplier *= (1 + creditBoost);

        // Apply penalties
        let penaltyDesc = "";
        if (translationRevealed) {
            
            
        }
        if (revealedCards.size > 0) {
            // Skill: Signal Shielding (Penalty Reduction)
            const hasHintShield = stats.unlockedSkills.includes('hint_shield_1');
            const penaltyFactor = hasHintShield ? 0.95 : 0.9;
            const cardPenalty = 1;
            
            penaltyDesc += ` CARD_SCAN[x${revealedCards.size}](-${Math.round((1 - cardPenalty) * 100)}%)`;
        }

        if (activeModifier === 'SIGNAL_BOOST') {
            multiplier *= 2;
            penaltyDesc += " SIGNAL_BOOST(x2)";
        }
        
        const earned = Math.floor(baseCredits * multiplier);
        addLog(`${selectedText} CORRECT`, 'SUCCESS', { isAttempt: true, selected: selectedText, earned });
        
        let missionBonus = 0;
        let missionCompleted = false;

        setStats(prev => {
            let nextMission = prev.currentMission;
            let nextCredits = prev.credits + earned;
            let nextHP = prev.hp;
            let nextMissionsCleared = prev.missionsCleared;

            if (nextMission && nextMission.progress >= nextMission.goal) {
                missionCompleted = true;
                missionBonus = nextMission.reward;
                nextCredits += missionBonus;
                nextMissionsCleared += 1;

                // Skill: Data Recovery Protocol (Shielding)
                const healBonus = SKILL_TREE
                    .filter(s => prev.unlockedSkills.includes(s.id) && s.effect.type === 'HEAL_ON_MISSION')
                    .reduce((acc, s) => acc + s.effect.value, 5); // Base is 5
                
                nextHP = Math.min(prev.maxHp, prev.hp + healBonus);
                nextMission = generateMission(prev.currentLevel, nextMissionsCleared);
                
                addLog(`MISSION_OBJECTIVE_COMPLETE: SECTOR_FRAGMENT_SECURED.`, 'SUCCESS');
                addLog(`RESTORED BIOMETRIC_INTEGRITY: +${healBonus} HP.`, 'SUCCESS');
                addLog(`BONUS CREDITS ACQUIRED: +${missionBonus}`, 'SUCCESS');
            }

            return {
                ...prev,
                credits: nextCredits,
                missionsCleared: nextMissionsCleared,
                currentMission: nextMission,
                streak: (prev.streak || 0) + 1
            };
        });

        if (multiplier < 1 && stats.difficulty === 'HARD') {
            addLog(`WARNING: SIGNAL DEGRADATION DETECTED. REWARD SCALED: ${Math.floor(multiplier * 100)}%`, 'SYSTEM');
        }

        if (missionCompleted) {
            setShowMissionClear(true);
        }

        const newHistItem = { success: true, difficulty: stats.currentLevel };
        setHistory(prev => [...prev.slice(-9), newHistItem]);
        
        // Proficiency check
        if (history.length >= 2) {
            checkProficiency([...history.slice(-9), newHistItem]);
        }
        
        setTimeout(() => {
          setEvaluationResult(null);
          setLoading(false);
          fetchEncounter(stats.currentLevel);
        }, 1200);

      } else {
        setEvaluationResult('failure');
        // removed
        addLog(`[DECRYPT_FAILED] ATTEMPT FAILED FOR SEGMENT: "${encounter.prompt.replace(/(?:___|_ _ _|\(\s*㉠\s*\))/i, '[  ]')}"`, 'ERROR');
        addLog(`SELECTED TRANSLATION: "${selectedText}"`, 'ERROR');
        addLog(`CORRECT SEQUENCE REQUIRED: "${correctText}"`, 'SUCCESS');
        if (result.terminal_log) {
          addLog(`DIAGNOSTIC: ${result.terminal_log}`, 'ERROR');
        }
        
        let damage = 5;
        if (stats.difficulty === 'EASY') damage = 2;
        if (stats.difficulty === 'HARD') damage = 10;
        addLog(`STREAK BROKEN.`, 'ERROR');
        
        setStats(prev => {
            let nextMission = prev.currentMission;
            if (nextMission) {
                nextMission = { ...nextMission, progress: Math.max(0, nextMission.progress - 1) };
            }
            return { 
                ...prev, 
                streak: 0,
                currentMission: nextMission
            };
        });

        const newHistItem = { success: false, difficulty: stats.currentLevel };
        setHistory(prev => [...prev.slice(-9), newHistItem]);
        if (history.length >= 2) {
            checkProficiency([...history.slice(-9), newHistItem]);
        }
        
        if (encounter) {
            setRecentQuestionIds(prev => {
                const newRecent = [...prev.filter(id => id !== encounter.id.toString()), encounter.id.toString()];
                return newRecent.slice(-10);
            });
        }

        setTimeout(() => {
          setEvaluationResult(null);
          setLoading(false);
          fetchEncounter(stats.currentLevel);
        }, 1200);
      }
    } catch (error) {
      addLog('EXECUTION_FAILURE: UNKNOWN PACKET LOSS.', 'ERROR');
      setLoading(false);
    }
  };

  
  const handlePurchaseModifier = (mod: 'CRITICAL_INSIGHT' | 'SIGNAL_BOOST') => {
      const cost = mod === 'CRITICAL_INSIGHT' ? 300 : 150;
      if (stats.credits >= cost && activeModifier !== mod) {
          setStats(prev => ({ ...prev, credits: prev.credits - cost }));
          setActiveModifier(mod);
          addLog(`TACTICAL_MODIFIER_ENGAGED: ${mod}. CREDITS -${cost}`, 'SYSTEM');
      }
  };

  const getPromptTranslationCost = () => {
      if (stats.difficulty === 'EASY') return 50;
      if (stats.difficulty === 'HARD') return 150;
      return 100;
  };

  const getCardTranslationCost = () => {
      if (stats.difficulty === 'EASY') return 25;
      if (stats.difficulty === 'HARD') return 75;
      return 50;
  };

  const handleRevealTranslation = () => {
      const cost = getPromptTranslationCost();
      if (stats.credits >= cost) {
          setStats(prev => ({ ...prev, credits: prev.credits - cost }));
          setTranslationRevealed(true);
          addLog(`DECRYPTION PROTOCOL INITIATED. CREDITS -${cost}`, 'SYSTEM');
      }
  };

  const handleRevealCard = (id: number) => {
      const cost = getCardTranslationCost();
      if (stats.credits >= cost) {
          setStats(prev => ({ ...prev, credits: prev.credits - cost }));
          setRevealedCards(prev => new Set(prev).add(id));
          addLog(`INSPECTING CORE DATA: CARD_ID_${id}. CREDITS -${cost}`, 'SYSTEM');
      }
  };

  const checkProficiency = async (currentHistory: { success: boolean; difficulty: number }[]) => {
      try {
          const response = await fetch('/api/proficiency', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ history: currentHistory }),
          });
          const data = await response.json();
          if (data.newLevel && data.newLevel !== stats.currentLevel) {
              let newGoal = 5;
              if (stats.difficulty === 'EASY') newGoal = 3;
              if (stats.difficulty === 'HARD') newGoal = 8;
              if (data.newLevel > stats.currentLevel) newGoal += (data.newLevel - stats.currentLevel); // Harder as you go up

              setStats(prev => ({ ...prev, currentLevel: data.newLevel, missionGoal: newGoal, missionProgress: 0 }));
              addLog(`SYNC_LEVEL ADJUSTED: TOPIK_${data.newLevel}.`, 'SYSTEM');
              addLog(`MISSION_PARAMETERS_RECALIBRATED: GOAL=${newGoal}`, 'SYSTEM');
              if (data.newLevel >= stats.targetLevel) {
                  setGameState('VICTORY');
                  addLog(`MISSION_ACCOMPLISHED: TARGET_LEVEL_${stats.targetLevel} ACHIEVED.`, 'SUCCESS');
              }
          }
      } catch (e) {
          console.error("Proficiency update failed", e);
      }
  }

    const exitToRoot = () => {
    setGameState('INIT');
    setEncounter(null);
  };

  const restart = async () => {
    if (user) {
        const path = `users/${user.uid}/gameState/current`;
        try {
            const { deleteDoc, doc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            await deleteDoc(doc(db, path));
        } catch (e) {
            handleFirestoreError(e, OperationType.DELETE, path);
        }
    }
    setGameState('INIT');
    setStats(INITIAL_STATS);
    setEncounter(null);
    setLogs([]);
    setHistory([]);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-emerald-400 overflow-hidden selection:bg-emerald-500/30 font-mono p-4">
      {gameState !== 'INIT' && (
        <StatusBar stats={stats} />
      )}
      
      <MissionNotification 
        show={showMissionClear}
        onComplete={() => setShowMissionClear(false)}
        missionNumber={stats.missionsCleared + (showMissionClear ? 0 : 0)} // If we increment before showing, we don't need +1
        bonus={stats.currentLevel * 500}
      />

      <main className="flex-1 flex gap-4 overflow-hidden mb-4">
        <AnimatePresence mode="wait">
          {gameState === 'INIT' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <StartScreen onStart={handleStart} />
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex gap-4 overflow-hidden"
            >
              <div className="flex-1 h-full flex flex-col min-w-0">
                <EncounterPane 
                  encounter={encounter} 
                  loading={loading} 
                  difficulty={stats.difficulty} 
                  translationRevealed={translationRevealed}
                  promptTranslationCost={getPromptTranslationCost()}
                  credits={stats.credits}
                  onRevealTranslation={handleRevealTranslation}
                />
              </div>

              <div className="w-1/3 h-full flex flex-col min-w-[300px] gap-2">

                <ErrorBoundary>
                <SyntaxStack 
                  cards={encounter?.cards || []} 
                  selectedId={selectedCardId}
                  onSelect={setSelectedCardId}
                  onExecute={handleExecute}
                  disabled={loading || !encounter}
                  revealedCards={revealedCards}
                  onRevealCard={handleRevealCard}
                  difficulty={stats.difficulty}
                  feedbackState={evaluationResult}
                  cardTranslationCost={getCardTranslationCost()}
                  credits={stats.credits}
                  correctId={activeModifier === 'CRITICAL_INSIGHT' && encounter ? encounter.cards[encounter.correct_answer_id].id : null}
                />
                </ErrorBoundary>
              </div>

              <div className="w-1/4 h-full hidden lg:flex flex-col min-w-[250px]">
                <TerminalFeed logs={logs} history={history} />
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 space-y-8"
            >
              <div className={`p-12 border-2 bg-slate-900/80 text-center space-y-4 max-w-md w-full ${gameState === 'GAMEOVER' ? 'border-red-500' : 'border-emerald-500'}`}>
                {gameState === 'GAMEOVER' ? (
                  <>
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-red-500 uppercase tracking-tighter italic">// CONNECTION_LOST</h2>
                    <p className="text-red-500/70 text-xs">YOUR BIOMETRIC SIGNATURE HAS FADED. RELOGIN REQUIRED.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-black text-emerald-400 uppercase tracking-tighter italic">// CORE_ACCESSED</h2>
                    <p className="text-emerald-400/70 text-xs">TARGET PROFICIENCY LEVEL REACHED. DATA RETRIEVED.</p>
                  </>
                )}
                
                <div className="pt-8 flex flex-col gap-4">
                    <div className="flex justify-between text-[10px] text-emerald-500/50 uppercase border-b border-emerald-500/20 pb-1 font-mono">
                        <span>// FINAL_CREDITS</span>
                        <span className="font-bold text-white">{stats.credits}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-emerald-500/50 uppercase border-b border-emerald-500/20 pb-1 font-mono">
                        <span>// MAX_SYNC_ACHIEVED</span>
                        <span className="font-bold text-white">TOPIK_{stats.currentLevel}</span>
                    </div>
                </div>

                <button
                  onClick={restart}
                  className="w-full mt-8 border border-emerald-500 p-3 flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all font-bold group uppercase tracking-widest"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  // REBOOT_SYSTEM
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showArchive && <DataArchive onClose={() => setShowArchive(false)} />}
        {showWriting && <WritingModule onClose={() => setShowWriting(false)} currentLevel={stats.currentLevel} />}
        {showProfile && (
          <ProfileSection 
            onClose={() => setShowProfile(false)} 
            currentLevel={stats.currentLevel} 
            stats={stats}
            onUnlockSkill={handleUnlockSkill}
            onLevelBypass={(lvl) => {
                setStats(prev => ({ ...prev, currentLevel: lvl }));
                if (gameState === 'PLAYING') {
                    fetchEncounter(lvl);
                }
            }} 
          />
        )}
        {showChat && <ChatBot onClose={() => setShowChat(false)} stats={stats} />}
      </AnimatePresence>

      <footer className="h-12 flex gap-4 text-[10px] uppercase font-bold select-none relative z-50">
        <div className="flex-1 border border-slate-700 flex items-center px-4 gap-6 bg-slate-900/30 overflow-visible whitespace-nowrap">
          <Tooltip content="Grammar structure analysis">
            <button onClick={() => handlePlayModeChange('syntax')} className={`cursor-pointer transition-colors flex items-center gap-1 ${playMode === 'syntax' ? 'text-emerald-500 opacity-100' : 'text-white opacity-40 hover:opacity-100 hover:text-emerald-400'}`}>
              [1] SYNTAX_LAB
            </button>
          </Tooltip>

          <Tooltip content="Vocabulary and expression drills">
            <button onClick={() => handlePlayModeChange('vocab')} className={`cursor-pointer transition-colors flex items-center gap-1 ${playMode === 'vocab' ? 'text-emerald-500 opacity-100' : 'text-white opacity-40 hover:opacity-100 hover:text-emerald-400'}`}>
              [2] VOCAB_LAB
            </button>
          </Tooltip>

          <Tooltip content="Review all synchronized data points">
            <button onClick={() => setShowArchive(true)} className="text-white opacity-80 hover:opacity-100 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
              [3] DATA_ARCHIVE
            </button>
          </Tooltip>

          <Tooltip content="Practice sentence production">
            <button onClick={() => setShowWriting(true)} className="text-white opacity-80 hover:opacity-100 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
              [4] WRITING_MODULE
            </button>
          </Tooltip>

          <Tooltip content="User biometrics and neural upgrades">
            <button onClick={() => setShowProfile(true)} className="text-white opacity-80 hover:opacity-100 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
              [5] STUDENT_PROFILE
            </button>
          </Tooltip>

          <Tooltip content="External intelligence interface">
            <button onClick={() => setShowChat(true)} className="text-emerald-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              [6] AI_ADVISOR
            </button>
          </Tooltip>
        </div>
        <Tooltip content="Reset session and return to start">
          <button 
              onClick={exitToRoot}
              className="w-48 h-full border border-slate-700 flex items-center justify-center bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer text-emerald-500/60"
          >
            EXIT_TO_ROOT [ESC]
          </button>
        </Tooltip>
      </footer>
    </div>
  );
}
