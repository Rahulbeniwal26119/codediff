import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';

export default function Controls({ isDarkTheme, setIsDarkTheme, leftContent, rightContent, selectedLanguage, setShowUpdateButton, showUpdateButton}) {
    const { diffId } = useParams();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('authToken');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="controls flex items-center gap-3 text-gray-200">
            {diffId && showUpdateButton && (
                <UpdateLink 
                    leftContent={leftContent} 
                    rightContent={rightContent} 
                    selectedLanguage={selectedLanguage} 
                />
            )}
            <Share 
                leftContent={leftContent} 
                rightContent={rightContent} 
                selectedLanguage={selectedLanguage} 
            />
            <button 
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className="px-4 py-1.5 rounded-full text-sm transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border flex items-center gap-2"
            >
                {isDarkTheme ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark
                    </>
                )}
            </button>
            {isLoggedIn ? (
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border"
                >
                    <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-xs font-medium">R</span>
                    </div>
                    Logout
                </button>
            ) : (
                <GoogleLogin className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border" />
            )}
        </div>
    );
}