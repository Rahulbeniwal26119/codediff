import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaRobot, FaKey, FaTimes } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Button from './ui/Button';
import { cn } from '../utils/cn';
import { useCode } from '../context/CodeContext';

const AIExplainModal = ({ isOpen, onClose, leftCode, rightCode, language }) => {
    const { isDarkTheme } = useCode();
    const [apiKey, setApiKey] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('input-key');

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, [isOpen]);

    const handleSaveKey = () => {
        if (!apiKey.trim()) {
            toast.error('Please enter a valid API key');
            return;
        }
        localStorage.setItem('gemini_api_key', apiKey);
        handleExplain();
    };

    const handleExplain = async () => {
        if (!leftCode && !rightCode) {
            toast.error('No code to explain');
            return;
        }

        setIsLoading(true);
        setStep('explaining');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
You are an expert senior software engineer.
Explain the changes between the following two code snippets in ${language}.
Focus on the "why" and "what" changed. Be concise and professional.
Use markdown formatting.

Original Code:
\`\`\`${language}
${leftCode ? leftCode.slice(0, 2000) : '(empty)'}
\`\`\`

Modified Code:
\`\`\`${language}
${rightCode ? rightCode.slice(0, 2000) : '(empty)'}
\`\`\`

Explanation:
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            setExplanation(text);
            setStep('result');
        } catch (error) {
            console.error('AI Explanation failed:', error);
            toast.error('Failed to generate explanation. Check your API Key.');
            setStep('input-key');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
        setStep('input-key');
        toast.success('API Key removed');
    };

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
                            isDarkTheme ? "border-surface-700" : "border-surface-200"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-2xl bg-primary-100 dark:bg-primary-900/30">
                                    <FaRobot className="text-primary-600 dark:text-primary-400 text-xl" />
                                </div>
                                <h2 className={cn(
                                    "text-xl font-bold",
                                    isDarkTheme ? "text-surface-100" : "text-surface-900"
                                )}>
                                    AI Code Explanation
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

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {step === 'input-key' && (
                                <div className="space-y-4">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800">
                                        <p className="text-sm text-primary-800 dark:text-primary-200">
                                            To keep this tool free, we use your own Google Gemini API Key. 
                                            Your key is stored locally in your browser and never sent to our servers.
                                        </p>
                                        <a 
                                            href="https://aistudio.google.com/app/apikey" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary-600 dark:text-primary-400 underline mt-2 block font-medium"
                                        >
                                            Get a free Gemini API Key here →
                                        </a>
                                    </div>

                                    <div>
                                        <label className={cn(
                                            "block text-sm font-medium mb-2",
                                            isDarkTheme ? "text-surface-300" : "text-surface-700"
                                        )}>
                                            Enter Gemini API Key
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FaKey className="text-surface-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className={cn(
                                                    "pl-12 block w-full rounded-2xl border-2 shadow-sm p-3 transition-all",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                                                    isDarkTheme 
                                                        ? "border-surface-700 bg-surface-900 text-surface-100" 
                                                        : "border-surface-300 bg-white text-surface-900"
                                                )}
                                                placeholder="AIzaSy..."
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSaveKey}
                                        variant="filled"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Generate Explanation
                                    </Button>
                                </div>
                            )}

                            {step === 'explaining' && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FaRobot className="text-primary-600 text-2xl animate-pulse" />
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "animate-pulse font-medium",
                                        isDarkTheme ? "text-surface-300" : "text-surface-600"
                                    )}>
                                        Analyzing code differences...
                                    </p>
                                </div>
                            )}

                            {step === 'result' && (
                                <div className="space-y-4">
                                    <div className={cn(
                                        "prose dark:prose-invert max-w-none p-4 rounded-2xl",
                                        isDarkTheme ? "bg-surface-900" : "bg-surface-50"
                                    )}>
                                        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                            {explanation}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {step === 'result' && (
                            <div className={cn(
                                "p-4 border-t flex justify-between",
                                isDarkTheme 
                                    ? "border-surface-700 bg-surface-900/50" 
                                    : "border-surface-200 bg-surface-50"
                            )}>
                                <button
                                    onClick={handleClearKey}
                                    className="text-xs text-error-500 hover:text-error-700 font-medium"
                                >
                                    Clear API Key
                                </button>
                                <Button
                                    onClick={onClose}
                                    variant="tonal"
                                    size="md"
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIExplainModal;
