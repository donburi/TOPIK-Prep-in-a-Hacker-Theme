import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send } from 'lucide-react';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
  onClose: () => void;
}

export const ChatBot: React.FC<Props> = ({ stats, onClose }) => {
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: `Welcome Operator. Based on your current TOPIK Level ${stats.currentLevel} and difficulty ${stats.difficulty}, I am ready to advise on your progression.` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);

    // Simple bot logic
    let response = "Scanning archives...";
    if (userMsg.toLowerCase().includes('progress')) {
        response = `You have reached Level ${stats.currentLevel}. To reach Level ${stats.targetLevel}, focus on advanced grammar and Sino-Korean vocabulary.`;
    } else if (userMsg.toLowerCase().includes('help')) {
        response = "Try asking about 'progress' or 'how to improve'.";
    } else {
        response = "I am currently calibrating. Focus on your training nodes.";
    }
    
    setMessages(prev => [...prev, { sender: 'bot', text: response }]);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 right-4 w-80 h-96 bg-slate-950 border border-emerald-500 flex flex-col z-[100] shadow-2xl"
    >
        <div className="p-3 border-b border-emerald-500/30 flex justify-between items-center bg-slate-900">
            <span className="text-emerald-400 font-bold text-xs uppercase flex gap-2 items-center"><Bot size={14}/> K-BOT_ADVISOR</span>
            <button onClick={onClose}><X size={14} className="text-emerald-500"/></button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs">
            {messages.map((m, i) => (
                <div key={i} className={m.sender === 'bot' ? 'text-emerald-300' : 'text-white text-right'}>
                   {m.sender === 'bot' ? '> ': ''} {m.text}
                </div>
            ))}
        </div>
        <div className="p-2 border-t border-emerald-500 flex gap-2">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent border-none text-white text-xs outline-none"
                placeholder="Ask bot..."
            />
            <button onClick={handleSend}><Send size={14} className="text-emerald-500"/></button>
        </div>
    </motion.div>
  );
};
