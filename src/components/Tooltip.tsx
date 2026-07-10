import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<Props> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return '-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2';
      case 'bottom': return '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full mt-2';
      case 'left': return 'top-1/2 -left-2 -translate-x-full -translate-y-1/2 mr-2';
      case 'right': return 'top-1/2 -right-2 translate-x-full -translate-y-1/2 ml-2';
      default: return '-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-[200] px-2 py-1 bg-slate-900 border border-emerald-500/50 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap pointer-events-none ${getPositionClasses()}`}
          >
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">
              {content}
            </div>
            <div className={`absolute w-2 h-2 bg-slate-900 border-emerald-500/50 transform rotate-45 ${
              position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
              position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
              position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' :
              'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
