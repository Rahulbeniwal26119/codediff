import { Toaster } from 'react-hot-toast';
import React, { useState } from 'react';
import './App.css';
import Controls from './components/Controls';
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

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
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
            <div className="header-controls">
              <div className="language-selector">
                <label>Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="bg-[#3c3c3c] border border-[#404040] rounded px-2 py-1 text-sm"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang.id} value={lang.name}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="file-controls">
                <div className="file-upload">
                  <label>Left File:</label>
                  <input
                    type="file"
                    onChange={handleFileUpload('left')}
                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java"
                  />
                </div>
                <div className="file-upload">
                  <label>Right File:</label>
                  <input
                    type="file"
                    onChange={handleFileUpload('right')}
                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java"
                  />
                </div>
              </div>
              <Controls isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} leftContent={leftContent} rightContent={rightContent} selectedLanguage={selectedLanguage} />
            </div>

            <CodeEditor isDarkTheme={isDarkTheme} leftContent={leftContent} rightContent={rightContent} selectedLanguage={selectedLanguage} setLeftContent={setLeftContent} setRightContent={setRightContent} setSelectedLanguage={setSelectedLanguage} />

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
