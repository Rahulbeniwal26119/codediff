import { useState } from 'react';
import ManageLinksModal from './ManageLinksModal';

export default function ManageLinks({ disabled }) {
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        setShowModal(true);
    };

    return (
        <>
            <button 
                onClick={handleClick} 
                disabled={disabled}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                    disabled 
                        ? 'bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border'
                        : 'bg-[#2d2d2d] text-gray-200 border-gray-600 hover: border'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Manage
            </button>
            
            {showModal && <ManageLinksModal onClose={() => setShowModal(false)} />}
        </>
    );
} 