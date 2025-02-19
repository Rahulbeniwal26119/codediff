import { Toaster, toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import React, { useState , useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [leftContent, setLeftContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
  const [rightContent, setRightContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
  const [selectedLanguage, setSelectedLanguage] = useState('JSON');
  const { diffId } = useParams(); // Extract the diffId from the URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(diffId);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/code-diff/${diffId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Diff not found ');
            return;
          }
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        setData(result);
        console.log(result.data.code_before);
        setLeftContent(result.data.code_before);
        setRightContent(result.data.code_after);
        setSelectedLanguage(result.data.language);
        toast.success('Data loaded successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (diffId) {
      fetchData();
    }
  }, [diffId]);


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
    minimap: { enabled: true },
    fontSize: 20,
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
    originalEditable: true,
    modifiedEditable: true,
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

  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const handleThemeChange = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleShare = async () => {
    if (!leftContent || !rightContent) {
      toast.error(
        'Empty files cannot be shared',
        {
          duration: 2000,
          position: 'top-center',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }
      )
      return;
    }

    console.log(leftContent, rightContent, selectedLanguage);

    try {
      const response = await fetch(`${API_URL}/api/code-diff/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code_before: leftContent,
          code_after: rightContent,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to share code', {
          duration: 2000,
          position: 'top-center',
          style: {

          }
        })
        return;
      }

      const data = await response.json();
      const uuid = data.data.unique_identifier;
      // take current url and append uuid to it
      const shareUrl = `${window.location.origin}/${uuid}/`;

      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-[#333] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">
                🎉 Link Generated!!
                </p>
                <p className="mt-1 text-sm text-gray-400 truncate">
                  {shareUrl}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-600">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Copied again!', { duration: 1000 });
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#404040] focus:outline-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#404040] focus:outline-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-center',
      });

    } catch (error) {
      toast.error('Error sharing code', {
        duration: 2000,
        position: 'top-center',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      console.error('Error sharing code', error);
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
              <div className="controls flex items-center gap-2">
                <button
                  className="share-button inline-flex items-center gap-2 bg-[#252526] hover:bg-[#2d2d2d] border border-[#404040] hover:border-[#565656] rounded-sm px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-all duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#565656] active:bg-[#313131]"
                  onClick={handleShare}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </button>
                <button
                  onClick={handleThemeChange}
                  className="toggle-theme-button bg-[#252526] hover:bg-[#2d2d2d]  rounded-sm px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-all duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#565656]"
                >
                  {isDarkTheme ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="diff-section">
              <DiffEditor
                original={leftContent}
                modified={rightContent}
                language={selectedLanguage.toLowerCase()}
                theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                options={editorOptions}
                onMount={(editor) => {
                  const originalEditor = editor.getOriginalEditor();
                  const modifiedEditor = editor.getModifiedEditor();

                  // Handle original editor changes
                  let isUpdating = false;
                  originalEditor.onDidChangeModelContent(() => {
                    if (!isUpdating) {
                      isUpdating = true;
                      const newValue = originalEditor.getValue();
                      const selection = originalEditor.getSelection();
                      setLeftContent(newValue);
                      // Restore selection in the next tick
                      requestAnimationFrame(() => {
                        if (selection) {
                          originalEditor.setSelection(selection);
                          originalEditor.focus();
                        }
                        isUpdating = false;
                      });
                    }
                  });

                  modifiedEditor.onDidChangeModelContent(() => {
                    setRightContent(modifiedEditor.getValue());
                  });
                }}
              />
            </div>
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
