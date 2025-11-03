import { useState } from 'react';
import ManageLinksModal from './ManageLinksModal';
import { useCode } from '../context/CodeContext';

export default function ManageLinks({ disabled }) {
    const [showModal, setShowModal] = useState(false);
    const { isDarkTheme } = useCode();

    const handleClick = () => {
        if (!disabled) {
            setShowModal(true);
        }
    };

    return (
        <>
            <button 
                onClick={handleClick} 
                disabled={disabled}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 border ${
                    disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDarkTheme 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600 hover:border-gray-500' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 hover:border-gray-400'
                }`}
                title="Manage your diffs"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">Manage</span>
            </button>
            
            {showModal && <ManageLinksModal onClose={() => setShowModal(false)} />}
        </>
    );
}