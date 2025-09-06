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
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                    disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDarkTheme 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Manage your diffs"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline text-sm">Manage</span>
            </button>
            
            {showModal && <ManageLinksModal onClose={() => setShowModal(false)} />}
        </>
    );
}