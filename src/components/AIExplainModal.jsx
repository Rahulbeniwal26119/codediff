import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaRobot, FaKey, FaTimes } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AIExplainModal = ({ isOpen, onClose, leftCode, rightCode, language }) => {
    const [apiKey, setApiKey] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('input-key'); // 'input-key' | 'explaining' | 'result'

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            if (isOpen && step === 'input-key') {
                // Auto-start if key exists? Maybe better to let user confirm.
                // For now, just pre-fill.
            }
        }
    }, [isOpen, step]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <FaRobot className="text-blue-500 text-xl" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            AI Code Explanation
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'input-key' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    To keep this tool free, we use your own Google Gemini API Key. 
                                    Your key is stored locally in your browser and never sent to our servers.
                                </p>
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 underline mt-2 block"
                                >
                                    Get a free Gemini API Key here
                                </a>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Enter Gemini API Key
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaKey className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                        placeholder="AIzaSy..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveKey}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Generate Explanation
                            </button>
                        </div>
                    )}

                    {step === 'explaining' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="text-gray-600 dark:text-gray-300 animate-pulse">
                                Analyzing code differences...
                            </p>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="space-y-4">
                            <div className="prose dark:prose-invert max-w-none">
                                {/* Simple markdown rendering - for now just preserving whitespace */}
                                <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                    {explanation}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'result' && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-900/50">
                        <button
                            onClick={handleClearKey}
                            className="text-xs text-red-500 hover:text-red-700"
                        >
                            Clear API Key
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIExplainModal;
