import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';
import ManageLinks from './ManageLinks';
import Tooltip from './Tooltip';
import { useCode } from '../context/CodeContext';

const isLoggedIn = localStorage.getItem('access_token');

export default function Controls() {
    const { isDarkTheme, setIsDarkTheme, leftContent, rightContent, selectedLanguage, setShowUpdateButton, showUpdateButton } = useCode();
    const { diffId } = useParams();
    const navigate = useNavigate();
    console.log(diffId, showUpdateButton);

    return (
        <div className="controls flex items-center gap-3 text-gray-200">
            <Tooltip
                content={!diffId ? "You need to save a diff first to update it" : !showUpdateButton ? "Cannot update: insufficient permissions or anonymous diffs." : ""}
                disabled={diffId && showUpdateButton}
            >
                <div className={`${(!diffId || !showUpdateButton) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <UpdateLink
                        leftContent={leftContent}
                        rightContent={rightContent}
                        selectedLanguage={selectedLanguage}
                        disabled={!diffId || !showUpdateButton}
                    />
                </div>
            </Tooltip>
            <Share
                leftContent={leftContent}
                rightContent={rightContent}
                selectedLanguage={selectedLanguage}
            />
            <Tooltip
                content={!isLoggedIn ? "Login to manage your saved diffs" : ""}
                disabled={isLoggedIn}
            >
                <div className={`${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ManageLinks disabled={!isLoggedIn} />
                </div>
            </Tooltip>
            <GoogleLogin />
        </div>
    );
}

