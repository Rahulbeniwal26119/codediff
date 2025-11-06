import { useParams } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';
import ManageLinks from './ManageLinks';
import Tooltip from './Tooltip';
import ToggleTheme from './ToggleTheme';
import FullscreenToggle from './FullscreenToggle';
import { useCode } from '../context/CodeContext';

const isLoggedIn = localStorage.getItem('access_token');

export default function Controls() {
    const { leftContent, rightContent, selectedLanguage, showUpdateButton } = useCode();
    const { diffId } = useParams();

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            {/* Fullscreen toggle */}
            {/* <FullscreenToggle /> */}
            
            {/* Theme toggle */}
            <ToggleTheme />
            
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
        </div>
    );
}

