import React from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaTerminal } from 'react-icons/fa';

const ExecutionResultModal = ({ isOpen, onClose, result, type }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const isError = type === 'error';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${
                    isSuccess ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' :
                    isError ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' :
                    'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                }`}>
                    <div className="flex items-center gap-2">
                        {isSuccess && <FaCheckCircle className="text-green-500 text-xl" />}
                        {isError && <FaExclamationTriangle className="text-red-500 text-xl" />}
                        {!isSuccess && !isError && <FaTerminal className="text-gray-500 text-xl" />}
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            {isSuccess ? 'Success' : isError ? 'Error' : 'Execution Output'}
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
                <div className="flex-1 overflow-y-auto p-0 bg-[#1e1e1e]">
                    <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words">
                        {result}
                    </pre>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExecutionResultModal;
