import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, required, leftIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className={`label-standard ${required ? 'label-required' : ''} ${error ? 'text-semantic-danger' : ''}`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`input-standard ${error ? 'input-error' : ''} ${leftIcon ? '!pl-10' : ''} ${className}`}
            {...props}
          />
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-xs font-bold text-semantic-danger flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
          {!error && helperText && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 text-xs text-slate-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

