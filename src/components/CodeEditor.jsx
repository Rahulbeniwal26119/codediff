import { DiffEditor } from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useCode } from '../context/CodeContext';

const API_URL = process.env.REACT_APP_API_URL;

export default function CodeEditor() {
    const {
        isDarkTheme,
        leftContent,
        rightContent,
        selectedLanguage,
        setLeftContent,
        setRightContent,
        setSelectedLanguage,
        setShowUpdateButton,
        isSideBySide
    } = useCode();

    const { diffId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/code-diff/${diffId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error('Diff not found ');
                        setTimeout(
                            () => {
                                window.location.href = '/';
                            },
                            2000
                        )
                        return;
                    }
                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();
                console.log(result.data.code_before);
                setLeftContent(result.data.code_before);
                setRightContent(result.data.code_after);
                setSelectedLanguage(result.data.language);

                toast.success('Diff loaded successfully');
                if (localStorage?.access_token && result.data.access_token && localStorage?.access_token === result.data.access_token) {
                    setShowUpdateButton(true);
                } else {
                    setShowUpdateButton(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load diff');
            }
        };

        if (diffId) {
            fetchData();
        }
    }, [diffId, setLeftContent, setRightContent, setSelectedLanguage, setShowUpdateButton]);

    // const handleFormatClick = (side) => {
    //     try {
    //         const content = side === 'left' ? leftContent : rightContent;
    //         const formatted = JSON.stringify(JSON.parse(content), null, 2);
    //         side === 'left' ? setLeftContent(formatted) : setRightContent(formatted);
    //     } catch (e) {
    //         console.error('Invalid JSON');
    //     }
    // };

    const editorOptions = {
        minimap: { enabled: true, scale: 1 },
        fontSize: 16,
        lineHeight: 24,
        lineNumbers: 'on',
        folding: true,
        renderIndentGuides: true,
        formatOnPaste: true,
        formatOnType: true,
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
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
            horizontal: 'visible',
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
        },
        renderValidationDecorations: 'on',
        colorDecorators: true,
        originalEditable: true,
        modifiedEditable: true,
        renderSideBySide: isSideBySide,
        ignoreTrimWhitespace: false,
        renderOverviewRuler: true,
        diffWordWrap: 'on',
        enableSplitViewResizing: true,
    };

    return (
        <div className="h-full w-full flex flex-col">
            <DiffEditor
                height="100%"
                original={leftContent}
                modified={rightContent}
                language={selectedLanguage.toLowerCase()}
                theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                options={editorOptions}
                loading={<div className="flex items-center justify-center h-full">Loading editor...</div>}
                onMount={(editor) => {
                    console.log('Editor mounted successfully');
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
                onError={(error) => {
                    console.error('Editor error:', error);
                }}
            />
        </div>
    );
}