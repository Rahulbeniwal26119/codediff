import { useParams } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';
import ManageLinks from './ManageLinks';
import Tooltip from './Tooltip';
import { useCode } from '../context/CodeContext';

const isLoggedIn = localStorage.getItem('access_token');

export default function Controls({ compact = false }) {
    const { 
        leftContent, 
        rightContent, 
        selectedLanguage, 
        showUpdateButton,
    } = useCode();
    const { diffId } = useParams();

    return (
        <div className={compact ? 'flex items-center gap-1.5' : 'flex flex-wrap items-center justify-center gap-2 sm:gap-2'}>
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
                compact={compact}
            />
            
            {/* Manage links */}
            {isLoggedIn && (
                <Tooltip content="Manage your diffs">
                    <div>
                        <ManageLinks disabled={false} />
                    </div>
                </Tooltip>
            )}
            
            {/* Login/User */}
            <GoogleLogin compact={compact} />

        </div>
    );
}
