import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useModalStore } from '../../store/modalStore';

const GlobalConfirmModal: React.FC = () => {
  const { isOpen, options, closeModal } = useModalStore();

  if (!options) return null;

  const getIcon = () => {
    switch (options.type) {
      case 'danger': return <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />;
      case 'success': return <CheckCircleIcon className="w-10 h-10 text-emerald-500" />;
      case 'warning': return <ExclamationTriangleIcon className="w-10 h-10 text-amber-500" />;
      default: return <InformationCircleIcon className="w-10 h-10 text-sky-500" />;
    }
  };

  const getTypeStyles = () => {
    switch (options.type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-100';
      case 'success': return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-100';
      default: return 'bg-sky-500 hover:bg-sky-600 shadow-sky-100';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (options.onCancel) options.onCancel();
              closeModal();
            }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-white/20 p-8 overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-3xl ${options.type === 'danger' ? 'bg-red-50' : options.type === 'success' ? 'bg-emerald-50' : 'bg-sky-50'}`}>
                {getIcon()}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                  {options.title}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  {options.message}
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-4">
                <button
                  onClick={() => {
                    options.onConfirm();
                    closeModal();
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${getTypeStyles()}`}
                >
                  {options.confirmLabel || 'Confirmer'}
                </button>
                <button
                  onClick={() => {
                    if (options.onCancel) options.onCancel();
                    closeModal();
                  }}
                  className="w-full py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                >
                  {options.cancelLabel || 'Annuler'}
                </button>
              </div>
            </div>

            {/* Close Icon (Top Right) */}
            <button 
              onClick={() => {
                if (options.onCancel) options.onCancel();
                closeModal();
              }}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalConfirmModal;
