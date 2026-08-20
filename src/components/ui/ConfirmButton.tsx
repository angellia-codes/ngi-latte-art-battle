'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Loader2 } from 'lucide-react';

interface ConfirmButtonProps {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function ConfirmButton({
  onConfirm,
  label = 'Submit',
  confirmLabel = 'Tap Again to Confirm',
  disabled = false,
  loading = false,
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isConfirming) {
      timeout = setTimeout(() => {
        setIsConfirming(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isConfirming]);

  const handleClick = () => {
    if (disabled || loading) return;

    if (!isConfirming) {
      setIsConfirming(true);
    } else {
      setIsConfirming(false);
      onConfirm();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative w-full h-14 rounded-xl flex items-center justify-center text-white font-medium text-lg transition-colors overflow-hidden ${
        disabled
          ? 'bg-white/10 text-white/50 cursor-not-allowed'
          : isConfirming
          ? 'bg-terracotta'
          : 'bg-crema text-espresso-black'
      }`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="w-6 h-6 animate-spin" />
          </motion.div>
        ) : isConfirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-white"
          >
            <Lock className="w-5 h-5" />
            <span>{confirmLabel}</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
