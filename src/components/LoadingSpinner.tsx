import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/30 shrink-0 relative w-16 h-16 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-2xl border-4 border-background-dark/20 border-t-background-dark"
        ></motion.div>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-800 animate-pulse">Loading...</h2>
    </div>
  );

  if (fullScreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-background-light/80 backdrop-blur-sm flex items-center justify-center"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return <div className="p-8 w-full flex justify-center">{content}</div>;
};
