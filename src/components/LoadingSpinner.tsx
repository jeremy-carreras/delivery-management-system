import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
      <h2 className="text-base font-semibold text-slate-500 tracking-wide">Cargando...</h2>
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
