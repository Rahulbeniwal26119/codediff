import React, { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import './App.css';

function App() {
  const [leftContent, setLeftContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
  const [rightContent, setRightContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
  const [selectedLanguage, setSelectedLanguage] = useState('JSON');

  const supportedLanguages = [
    { id: 'json', name: 'JSON' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
  ];

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

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    folding: true,
    renderIndentGuides: true,
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    padding: { top: 10 },
    suggest: {
      snippets: 'on',
    },
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    hover: { enabled: true },
    parameterHints: { enabled: true },
    quickSuggestions: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible'
    },
    renderValidationDecorations: 'on',
    colorDecorators: true,
  };

  const handleFormatClick = (side) => {
    try {
      const content = side === 'left' ? leftContent : rightContent;
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      side === 'left' ? setLeftContent(formatted) : setRightContent(formatted);
    } catch (e) {
      console.error('Invalid JSON');
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <div className="App">
      <div className="layout-container">
        {/* <div className="ad-container ad-left">
          <div className="ad-placeholder">Ad Space</div>
        </div> */}

        <div className="main-content">
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
          </div>

          <div className="input-section">
            <div className="input-container">
              <h3>Original Code</h3>
              <div className="editor-wrapper">
                <Editor
                  height="200px"
                  language={selectedLanguage.toLowerCase()}
                  value={leftContent}
                  onChange={setLeftContent}
                  theme="vs-dark"
                  options={editorOptions}
                />
              </div>
            </div>
            <div className="input-container">
              <h3>Modified Code</h3>
              <div className="editor-wrapper">
                {/* <button 
                  onClick={() => handleFormatClick('right')}
                  className="absolute top-2 right-2 z-10 bg-[#333] hover:bg-[#444] px-3 py-1 rounded text-sm border border-[#404040]"
                >
                  Format JSON
                </button> */}
                <Editor
                  height="200px"
                  language={selectedLanguage.toLowerCase()}
                  value={rightContent}
                  onChange={setRightContent}
                  theme="vs-dark"
                  options={editorOptions}
                />
              </div>
            </div>
          </div>
          <div className="diff-section">
            <DiffEditor
              height="200px"
              original={leftContent}
              modified={rightContent}
              language={selectedLanguage.toLowerCase()}
              theme="vs-dark"
              options={editorOptions}
            />
          </div>
        </div>

        {/* <div className="ad-container ad-right">
          <div className="ad-placeholder">Ad Space</div>
        </div> */}
      </div>
    </div>
  );
}

export default App;
