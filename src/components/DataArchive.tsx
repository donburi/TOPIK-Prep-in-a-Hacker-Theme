import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database } from 'lucide-react';

export function DataArchive({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearned = async (uid: string) => {
      try {
        const q = query(collection(db, 'learnedItems'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const fetchedItems = snapshot.docs.map(d => ({...(d.data() as any), id: d.id}));
        fetchedItems.sort((a, b) => new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime());
        setItems(fetchedItems);
      } catch (e) {
        console.error("Failed to load archive", e);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchLearned(user.uid);
      } else {
        setItems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <div className="w-full max-w-4xl h-full max-h-[80vh] border border-emerald-500/50 bg-slate-900 flex flex-col font-mono text-emerald-400">
        
        {/* Header */}
        <div className="flex border-b border-emerald-500/50 p-4 items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold tracking-widest">// DATA_ARCHIVE : LEARNED_SYNTAX</h2>
          </div>
          <button onClick={onClose} className="hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {loading ? (
            <div className="animate-pulse">FETCHING RECORDS...</div>
          ) : items.length === 0 ? (
            <div className="text-emerald-500/50 text-center mt-20">NO DATA FOUND IN ARCHIVE.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border border-emerald-500/30 p-4 hover:border-emerald-500/80 transition-colors bg-slate-950/50 flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-xs font-bold text-emerald-500/50 uppercase">
                  {item.classification || 'UNK'}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-sans text-lg font-bold text-white leading-tight">
                    {item.text}
                  </div>
                  <div className="text-sm opacity-80 border-l-2 border-emerald-500/50 pl-3">
                    "{item.translation}"
                  </div>
                  <div className="text-[10px] text-emerald-500/40 uppercase tracking-widest mt-2 block">
                    TYPE: {item.type} | ACQUIRED: {new Date(item.learnedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
