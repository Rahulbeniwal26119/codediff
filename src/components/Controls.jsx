import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';
import ManageLinks from './ManageLinks';

const isLoggedIn = !!localStorage.getItem('access_token');


export default function Controls({ isDarkTheme, setIsDarkTheme, leftContent, rightContent, selectedLanguage, setShowUpdateButton, showUpdateButton}) {
    const { diffId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="controls flex items-center gap-3 text-gray-200">
            {diffId &&  showUpdateButton (
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
            { isLoggedIn && <ManageLinks />}
            <GoogleLogin />
        </div>
    );
}

