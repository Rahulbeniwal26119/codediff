import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';
import ManageLinks from './ManageLinks';
import Tooltip from './Tooltip';
import ToggleTheme from './ToggleTheme';
import FullscreenToggle from './FullscreenToggle';
import ToolsDropdown from './ToolsDropdown';
import AIExplainModal from './AIExplainModal';
import { useCode } from '../context/CodeContext';

const isLoggedIn = localStorage.getItem('access_token');

export default function Controls() {
    const { 
        leftContent, 
        rightContent, 
        selectedLanguage, 
        showUpdateButton,
        setLeftContent,
        setRightContent
    } = useCode();
    const { diffId } = useParams();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2">
            {/* Fullscreen toggle */}
            {/* <FullscreenToggle /> */}
            
            {/* Tools Dropdown (Beautify & Explain) */}
            <ToolsDropdown 
                leftCode={leftContent}
                rightCode={rightContent}
                language={selectedLanguage}
                onFormat={({ left, right }) => {
                    if (left !== undefined) setLeftContent(left);
                    if (right !== undefined) setRightContent(right);
                }}
                onExplain={() => setIsAIModalOpen(true)}
                disabled={!leftContent && !rightContent}
            />

            {/* Theme toggle */}
            {/* <ToggleTheme /> */}
            
            {/* Update button - only show when applicable */}
            {diffId && (
                <Tooltip
                    content={!showUpdateButton ? "Cannot update: insufficient permissions or anonymous diffs." : "Update this diff"}
                    disabled={showUpdateButton}
                >
                    <div className={`${!showUpdateButton ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <UpdateLink
                            leftContent={leftContent}
                            rightContent={rightContent}
                            selectedLanguage={selectedLanguage}
                            disabled={!showUpdateButton}
                        />
                    </div>
                </Tooltip>
            )}
            
            {/* Share button */}
            <Share
                leftContent={leftContent}
                rightContent={rightContent}
                selectedLanguage={selectedLanguage}
            />
            
            {/* Manage links */}
            <Tooltip
                content={!isLoggedIn ? "Login to manage your diffs" : "Manage your diffs"}
                disabled={isLoggedIn}
            >
                <div className={`${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ManageLinks disabled={!isLoggedIn} />
                </div>
            </Tooltip>
            
            {/* Login/User */}
            <GoogleLogin />

            {/* AI Modal */}
            <AIExplainModal 
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                leftCode={leftContent}
                rightCode={rightContent}
                language={selectedLanguage}
            />
        </div>
    );
}

