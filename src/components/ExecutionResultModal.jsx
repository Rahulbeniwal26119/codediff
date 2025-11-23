import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaTerminal } from 'react-icons/fa';
import Button from './ui/Button';
import { cn } from '../utils/cn';
import { useCode } from '../context/CodeContext';

const ExecutionResultModal = ({ isOpen, onClose, result, type }) => {
    const { isDarkTheme } = useCode();
    const isSuccess = type === 'success';
    const isError = type === 'error';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div 
                        className={cn(
                            "rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden",
                            isDarkTheme ? "bg-surface-800" : "bg-white"
                        )}
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={cn(
                            "flex items-center justify-between p-6 border-b",
                            isSuccess && "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800",
                            isError && "bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800",
                            !isSuccess && !isError && (isDarkTheme ? "border-surface-700" : "border-surface-200")
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-2xl",
                                    isSuccess && "bg-success-100 dark:bg-success-900/30",
                                    isError && "bg-error-100 dark:bg-error-900/30",
                                    !isSuccess && !isError && "bg-surface-100 dark:bg-surface-900/30"
                                )}>
                                    {isSuccess && <FaCheckCircle className="text-success-600 dark:text-success-400 text-xl" />}
                                    {isError && <FaExclamationTriangle className="text-error-600 dark:text-error-400 text-xl" />}
                                    {!isSuccess && !isError && <FaTerminal className="text-surface-600 dark:text-surface-400 text-xl" />}
                                </div>
                                <h2 className={cn(
                                    "text-xl font-bold",
                                    isDarkTheme ? "text-surface-100" : "text-surface-900"
                                )}>
                                    {isSuccess ? 'Success' : isError ? 'Error' : 'Execution Output'}
                                </h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isDarkTheme 
                                        ? "text-surface-400 hover:bg-surface-700" 
                                        : "text-surface-500 hover:bg-surface-100"
                                )}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content - Terminal style */}
                        <div className="flex-1 overflow-y-auto p-0 bg-[#1e1e1e]">
                            <pre className="p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                                {result}
                            </pre>
                        </div>

                        {/* Footer */}
                        <div className={cn(
                            "p-4 border-t flex justify-end",
                            isDarkTheme 
                                ? "border-surface-700 bg-surface-900/50" 
                                : "border-surface-200 bg-surface-50"
                        )}>
                            <Button
                                onClick={onClose}
                                variant="tonal"
                                size="md"
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExecutionResultModal;
