import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, PenTool, Send, Loader2, Info, ChevronRight, HelpCircle } from 'lucide-react';
import { WritingChart } from './WritingChart';

interface WritingPrompt {
  title: string;
  prompt: string;
  translation: string;
  expected_features: string[];
  blanks?: {
    ㄱ: { hint: string; correct_phrases: string[] };
    ㄴ: { hint: string; correct_phrases: string[] };
  };
  chart_data?: {
    chart_type: 'bar' | 'line' | 'pie' | 'compare_bar';
    chart_title: string;
    x_label: string;
    y_label: string;
    items: Array<{ label: string; value: number; secondary_value?: number }>;
    additional_info?: string[];
  };
}

export function WritingModule({ onClose, currentLevel }: { onClose: () => void, currentLevel: number }) {
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [topicType, setTopicType] = useState('question_51');
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [userInput, setUserInput] = useState('');
  const [blankA, setBlankA] = useState('');
  const [blankB, setBlankB] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; corrections: string[] } | null>(null);

  const requestPrompt = async () => {
    setLoadingPrompt(true);
    setPrompt(null);
    setResult(null);
    setUserInput('');
    setBlankA('');
    setBlankB('');
    setShowTranslation(false);
    try {
      const res = await fetch('/api/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLevel, topicType })
      });
      const data = await res.json();
      setPrompt(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrompt(false);
    }
  };

  const submitWriting = async () => {
    if (!prompt) return;
    const isBlankType = topicType === 'question_51' || topicType === 'question_52';
    
    if (isBlankType) {
      if (!blankA.trim() || !blankB.trim()) return;
    } else {
      if (!userInput.trim()) return;
    }

    setEvaluating(true);
    try {
      const payloadInput = isBlankType ? { ㄱ: blankA, ㄴ: blankB } : userInput;
      const res = await fetch('/api/evaluate_writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: payloadInput,
          prompt: prompt.prompt,
          expectedFeatures: prompt.expected_features
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setEvaluating(false);
    }
  };

  // Determine standard character requirements and ranges
  const charCount = userInput.length;
  const isQ53 = topicType === 'question_53';
  const isQ54 = topicType === 'question_54';
  const minTarget = isQ53 ? 200 : isQ54 ? 600 : 0;
  const maxTarget = isQ53 ? 300 : isQ54 ? 700 : 0;

  const getCharStatus = () => {
    if (!isQ53 && !isQ54) return null;
    if (charCount === 0) return { label: 'EMPTY', color: 'text-slate-500' };
    if (charCount < minTarget) return { label: 'UNDERFLOW', color: 'text-amber-400' };
    if (charCount > maxTarget) return { label: 'OVERFLOW', color: 'text-red-500' };
    return { label: 'OPTIMAL', color: 'text-emerald-400 font-bold' };
  };

  const charStatus = getCharStatus();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-5xl h-full max-h-[90vh] border border-cyan-500/30 bg-slate-900 rounded-lg shadow-2xl flex flex-col font-mono text-cyan-400 overflow-hidden">
        
        {/* Header */}
        <div className="flex border-b border-cyan-500/30 p-4 items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <PenTool className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm md:text-base font-bold tracking-widest uppercase">// MODULE_WRITING_LAB : ACTIVE</h2>
          </div>
          <button onClick={onClose} className="hover:text-white transition-colors cursor-pointer p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentLevel < 3 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-cyan-500/50 p-8 text-center space-y-4">
            <div className="text-2xl border border-cyan-500/20 p-4 font-bold tracking-widest bg-cyan-950/20 rounded">ACCESS DENIED</div>
            <p className="max-w-md text-sm leading-relaxed">The TOPIK II Writing Module is calibrated specifically for intermediate and advanced candidates (Level 3+).</p>
            <p className="text-xs font-mono">// CURRENT_NODE_LEVEL: {currentLevel}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-6">
            {!prompt ? (
              <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-white">SELECT WRITING PRACTICE PARAMETER</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluators will assess grammar structures, discourse coherence, spelling precision, and targeted character range output constraints dynamically.
                  </p>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <select 
                    className="flex-1 bg-slate-950 border border-cyan-500/30 text-cyan-300 px-4 py-2.5 outline-none rounded focus:border-cyan-500/80 font-mono text-sm"
                    value={topicType}
                    onChange={(e) => setTopicType(e.target.value)}
                  >
                     <option value="question_51">Question 51 (Public Notice/Email Blank Fill)</option>
                     <option value="question_52">Question 52 (Expository Paragraph Blank Fill)</option>
                     <option value="question_53">Question 53 (Data Analysis & custom Graph Description)</option>
                     <option value="question_54">Question 54 (Persuasive Essay Topic)</option>
                  </select>
                  <button 
                    onClick={requestPrompt}
                    disabled={loadingPrompt}
                    className="border border-cyan-500 text-cyan-400 px-6 py-2.5 hover:bg-cyan-500/20 active:bg-cyan-500/40 disabled:opacity-50 transition-colors uppercase font-bold text-sm tracking-wider cursor-pointer rounded flex items-center justify-center min-w-[160px]"
                  >
                    {loadingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Prompt"}
                  </button>
                </div>

                {/* Info Panel explaining the current selected task type */}
                <div className="w-full bg-slate-950/60 border border-slate-800 p-4 rounded text-xs space-y-2">
                  {topicType === 'question_51' && (
                    <>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        QUESTION 51: PRACTICAL TEXT (10 POINTS)
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Practice email draft, announcements, or messages. Complete two logical fill-in sentences for (ㄱ) and (ㄴ) using standard formal polite format (e.g. -습니다/ㅂ니다).
                      </p>
                    </>
                  )}
                  {topicType === 'question_52' && (
                    <>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        QUESTION 52: GENERAL EXPLANATION (10 POINTS)
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Practice expository, psychological, or informative text formats. Complete two logical fill-in sentences for (ㄱ) and (ㄴ) using standard written plain format (e.g. -ㄴ다/인다).
                      </p>
                    </>
                  )}
                  {topicType === 'question_53' && (
                    <>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        QUESTION 53: DATA CHART ANALYSIS (30 POINTS)
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Compare data values, explain trends, or outline survey causes and outlooks. Produce a single structured descriptive report matching standard Korean composition formats between 200 and 300 characters.
                      </p>
                    </>
                  )}
                  {topicType === 'question_54' && (
                    <>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        QUESTION 54: PERSUASIVE SOCIAL ESSAY (50 POINTS)
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Write a full 3-paragraph persuasive argumentative essay answering the guiding prompt questions. Maintain strict written style, grammatical complexity, and logical transitions between 600 and 700 characters.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full gap-4">
                
                {/* Topic / Task Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-cyan-500/15 pb-2.5 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                      // ACTIVE_PRACTICE_PROTOCOL :
                    </span>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2 leading-tight">
                      {prompt.title || "Untitled TOPIK Task"}
                    </h1>
                  </div>
                  <div className="flex gap-2 font-mono">
                    <button 
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="text-[10px] border border-cyan-500/30 px-3 py-1 bg-cyan-500/5 hover:bg-cyan-500/20 text-cyan-300 rounded cursor-pointer transition-colors"
                    >
                      {showTranslation ? "HIDE ENGLISH TRANSLATION" : "SHOW ENGLISH TRANSLATION"}
                    </button>
                    <button 
                      onClick={() => { setPrompt(null); setResult(null); }}
                      className="text-[10px] border border-red-500/30 px-3 py-1 bg-red-500/5 hover:bg-red-500/20 text-red-400 rounded cursor-pointer transition-colors"
                    >
                      RESET MODULE
                    </button>
                  </div>
                </div>

                {/* Main practice splits */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-auto">
                  
                  {/* Left Column: Prompts, Charts, expected criteria */}
                  <div className="lg:col-span-5 flex flex-col gap-4 overflow-auto pr-1">
                    
                    {/* Expository details */}
                    <div className="border border-slate-800 bg-slate-950/60 p-4 rounded flex flex-col gap-3 font-sans">
                      <span className="text-[10px] text-cyan-400/60 font-bold tracking-wider font-mono uppercase">
                        // PROMPT_CONTEXT_AND_CRITERIA
                      </span>
                      
                      {/* Interactive prompt text or standard prompt text */}
                      <p className="text-white text-base leading-relaxed tracking-wide font-medium bg-slate-900/50 p-3 border border-slate-800 rounded">
                        {prompt.prompt}
                      </p>

                      {showTranslation && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-cyan-950/20 p-3 rounded border border-cyan-500/10 text-xs text-slate-300 leading-relaxed italic"
                        >
                          <span className="font-bold font-mono text-[10px] text-cyan-400 uppercase block not-italic mb-1">// Translation:</span>
                          {prompt.translation}
                        </motion.div>
                      )}

                      {/* Expected Grammatical patterns/structures typical for TOPIK */}
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block font-mono uppercase mb-2">EXPECTED EXPRESSION PROTOCOLS:</span>
                        <div className="flex flex-wrap gap-2">
                          {prompt.expected_features.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Question 53 custom Graph Rendering if available */}
                    {topicType === 'question_53' && prompt.chart_data && (
                      <WritingChart chartData={prompt.chart_data} />
                    )}

                    {/* Quick evaluation helper info */}
                    <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded text-xs leading-relaxed text-slate-400">
                      <div className="flex gap-2 items-center text-slate-300 mb-1">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold">EVALUATOR BENCHMARKS</span>
                      </div>
                      {(topicType === 'question_51' || topicType === 'question_52') && (
                        <p>Write standard grammatical phrases for both slots. Avoid excessive clauses. Keep spacing, final particles (ㅂ니다/습니다 vs Plain -ㄴ다), and particles precise.</p>
                      )}
                      {topicType === 'question_53' && (
                        <p>Begin by describing the main title and parameters, outline the specific values and trends accurately, specify the supplementary details/reasons, and structure cohesive transitional phrases without redundant first-person pronouns.</p>
                      )}
                      {topicType === 'question_54' && (
                        <p>Implement a clear Introduction, Body, and Conclusion layout. Answer all prompt questions fully. Adopt formal, cohesive discourse patterns with advanced vocabulary and grammatical nesting.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Inputs & Results */}
                  <div className="lg:col-span-7 flex flex-col gap-4 min-h-0 overflow-auto">
                    {!result ? (
                      <div className="flex-1 flex flex-col gap-4">
                        
                        {/* INPUT ZONE depending on type */}
                        {(topicType === 'question_51' || topicType === 'question_52') ? (
                          // Fill-in-the-blank UI
                          <div className="flex-1 border border-cyan-500/15 bg-slate-950/20 rounded p-4 flex flex-col gap-4 justify-center">
                            <span className="text-[10px] text-cyan-400/60 font-bold tracking-wider font-mono uppercase block">// COMPLETE_BLANKS_SEQUENCE :</span>
                            
                            <div className="flex flex-col gap-4">
                              {/* Blank A field */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-white font-bold flex items-center justify-between">
                                  <span>ANSWER FOR (ㄱ)</span>
                                  {prompt.blanks?.ㄱ.hint && (
                                    <span className="text-[10px] text-slate-400 italic">Expected: {prompt.blanks.ㄱ.hint}</span>
                                  )}
                                </label>
                                <input
                                  type="text"
                                  className="bg-slate-950 border border-cyan-500/30 text-white p-3 rounded outline-none focus:border-cyan-500 font-mono text-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] placeholder-slate-600"
                                  placeholder="Type the sentence or phrase for (ㄱ)..."
                                  value={blankA}
                                  onChange={(e) => setBlankA(e.target.value)}
                                />
                              </div>

                              {/* Blank B field */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-white font-bold flex items-center justify-between">
                                  <span>ANSWER FOR (ㄴ)</span>
                                  {prompt.blanks?.ㄴ.hint && (
                                    <span className="text-[10px] text-slate-400 italic">Expected: {prompt.blanks.ㄴ.hint}</span>
                                  )}
                                </label>
                                <input
                                  type="text"
                                  className="bg-slate-950 border border-cyan-500/30 text-white p-3 rounded outline-none focus:border-cyan-500 font-mono text-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] placeholder-slate-600"
                                  placeholder="Type the sentence or phrase for (ㄴ)..."
                                  value={blankB}
                                  onChange={(e) => setBlankB(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Standard Composition Textarea
                          <div className="flex-1 flex flex-col gap-1.5 relative min-h-[220px]">
                            <textarea 
                              className="flex-1 bg-black/60 border border-cyan-500/25 text-cyan-100 p-4 outline-none resize-none placeholder-cyan-500/20 text-sm md:text-base rounded-md focus:border-cyan-500/70"
                              placeholder="Initiate compositions sequence in Korean. Maintain strict academic written layout (plain -ㄴ다/는다 form)..."
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                            />

                            {/* Character Count panel */}
                            <div className="flex items-center justify-between text-[11px] font-mono px-2 py-1 bg-slate-950 border-x border-b border-cyan-500/15 rounded-b">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">CHARACTER_COUNT:</span>
                                <span className={`font-bold ${charStatus?.color || 'text-cyan-400'}`}>{charCount}</span>
                                {minTarget > 0 && (
                                  <span className="text-slate-500">/ {minTarget}-{maxTarget}</span>
                                )}
                              </div>
                              {charStatus && (
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 ${charStatus.color}`}>
                                  {charStatus.label}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Submit Actions */}
                        <button 
                          onClick={submitWriting}
                          disabled={
                            evaluating || 
                            ((topicType === 'question_51' || topicType === 'question_52') 
                              ? (!blankA.trim() || !blankB.trim()) 
                              : !userInput.trim())
                          }
                          className="flex items-center justify-center gap-2 border border-cyan-500 py-3 text-sm tracking-wider hover:bg-cyan-500/10 active:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase font-bold cursor-pointer rounded"
                        >
                          {evaluating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                              <span>EVALUATING RESPONSES...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4"/>
                              <span>TRANSMIT RECORD FOR EVALUATION</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      // Display grading feedback/results
                      <div className="flex-1 bg-black/40 border border-cyan-500/20 p-4 md:p-5 rounded-lg overflow-auto space-y-5 flex flex-col">
                        
                        {/* Result Score Header */}
                        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block">// PROTOCOL_EVALUATION_SUMMARY</span>
                            <div className="text-base font-bold text-white tracking-widest">TRANSMISSION EVALUATED</div>
                          </div>
                          <div className="text-2xl font-black bg-cyan-500/10 px-4 py-2 border border-cyan-500/30 rounded text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                            SCORE: {result.score} <span className="text-xs text-cyan-500">/ 100</span>
                          </div>
                        </div>

                        {/* Answers reference for Q51/Q52 fill in */}
                        {(topicType === 'question_51' || topicType === 'question_52') && prompt.blanks && (
                          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-md text-xs space-y-2">
                            <span className="text-[10px] text-cyan-400/60 font-bold font-mono uppercase block">// VERIFIED_SOLUTION_SAMPLES :</span>
                            <div className="flex flex-col gap-2 font-mono text-slate-300">
                              <div>
                                <span className="text-cyan-400 font-bold">(ㄱ) Sample solutions:</span>
                                <ul className="list-disc list-inside pl-2.5 mt-0.5">
                                  {prompt.blanks.ㄱ.correct_phrases.map((phrase, pi) => (
                                    <li key={pi} className="text-white">{phrase}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-cyan-400 font-bold">(ㄴ) Sample solutions:</span>
                                <ul className="list-disc list-inside pl-2.5 mt-0.5">
                                  {prompt.blanks.ㄴ.correct_phrases.map((phrase, pi) => (
                                    <li key={pi} className="text-white">{phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Critique Section */}
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">// EXAMINER_CRITIQUE_REPORT :</div>
                          <div className="text-slate-100 text-sm leading-relaxed font-sans bg-slate-900/20 p-3 rounded border border-slate-900">
                            {result.feedback}
                          </div>
                        </div>

                        {/* Suggested Correction Rewrites */}
                        {result.corrections && result.corrections.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">// STRUCTURAL_OPTIMIZATIONS :</div>
                            <ul className="space-y-2 text-sm text-amber-400/90 font-sans bg-amber-500/5 p-3 rounded border border-amber-500/10">
                              {result.corrections.map((c, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                  <span className="text-amber-500">✔</span>
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Request restart */}
                        <button 
                          onClick={() => { setResult(null); requestPrompt(); }}
                          className="w-full border border-cyan-500/40 py-2.5 hover:bg-cyan-500/10 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all rounded"
                        >
                          LOAD NEXT EVALUATION SEQUENCE
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
