import { Toaster } from 'react-hot-toast';
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';

function App() {

  const [leftContent, setLeftContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
  const [rightContent, setRightContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');

  const supportedLanguages = [
    { id: 'json', name: 'JSON' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('JSON');
  const [showUpdateButton, setShowUpdateButton] = useState(false);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleUpdateButtonClick = (value) => {
    setShowUpdateButton(value);
  };

  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const handleThemeChange = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleFileUpload = (side) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (side === 'left') {
          setLeftContent(e.target.result);
        } else {
          setRightContent(e.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#1e1e1e]' : 'bg-[#ffffff]'} text-gray-300`}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #404040',
          },
        }}
      />

      <div className="">
        <div className={`layout-container ${isDarkTheme ? 'dark' : 'light'}`}>
          {/* <div className="ad-container ad-left">
            <div className="ad-placeholder">Ad Space</div>
          </div> */}

          <div className={`main-content ${isDarkTheme ? 'dark' : 'light'}`}>
            <Header
              isDarkTheme={isDarkTheme}
              setIsDarkTheme={setIsDarkTheme}
              leftContent={leftContent}
              rightContent={rightContent}
              selectedLanguage={selectedLanguage}
              setShowUpdateButton={setShowUpdateButton}
              showUpdateButton={showUpdateButton}
              handleLanguageChange={handleLanguageChange}
              handleFileUpload={handleFileUpload}
              supportedLanguages={supportedLanguages}
              setLeftContent={setLeftContent}
              setRightContent={setRightContent}
              setSelectedLanguage={setSelectedLanguage}
            />

            <CodeEditor 
              isDarkTheme={isDarkTheme} 
              leftContent={leftContent} 
              rightContent={rightContent} 
              selectedLanguage={selectedLanguage} 
              setLeftContent={setLeftContent} 
              setRightContent={setRightContent} 
              setSelectedLanguage={setSelectedLanguage}
              setShowUpdateButton={setShowUpdateButton}
            />
          </div>

          

          {/* <div className="ad-container ad-right">
            <div className="ad-placeholder">Ad Space</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;
