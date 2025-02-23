import GoogleLogin from './GoogleLogin';
import Share from './Share';
import UpdateLink from './UpdateLink';
import ToggleTheme from './ToggleTheme';
import { useParams } from 'react-router-dom';


export default function Controls({ isDarkTheme, setIsDarkTheme, leftContent, rightContent, selectedLanguage, setShowUpdateButton, showUpdateButton}) {

    const { diffId } = useParams();

    return (
        <div className="controls flex items-center gap-2">
            {diffId && showUpdateButton && <UpdateLink leftContent={leftContent} rightContent={rightContent} selectedLanguage={selectedLanguage} />}
            <Share leftContent={leftContent} rightContent={rightContent} selectedLanguage={selectedLanguage} />
            <GoogleLogin />
            <ToggleTheme isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} />
        </div>
    );
}