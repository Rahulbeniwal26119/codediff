import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

function DiffViewer({ original, modified, language }) {
  const options = {
    renderSideBySide: true,
    minimap: { enabled: false },
    fontSize: 16, // Larger, more comfortable font size for developers
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    diffWordWrap: 'on',
    lineHeight: 26, // Better line spacing for 16px font
    padding: { top: 16, bottom: 16, left: 8, right: 8 },
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Ubuntu Mono', monospace",
    fontLigatures: true, // Enable font ligatures for better code readability
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: true,
    smoothScrolling: true,
    diffEditor: {
      renderSideBySide: true,
      enableSplitViewResizing: true,
      ignoreTrimWhitespace: false,
      renderIndicators: true,
      originalEditable: false,
      renderMarginRevertIcon: true,
      maxComputationTime: 0, // Unlimited computation time for better diff quality
      diffCodeLens: true
    }
  };

  return (
    <div className="diff-container">
      <div className="diff-header">
        <div className="diff-options">
          <label>
            <input type="checkbox" defaultChecked />
            Show missing properties
          </label>
        </div>
        <div className="diff-navigation">
          <button>&lt;</button>
          <span>1 of 2</span>
          <button>&gt;</button>
        </div>
      </div>
      <DiffEditor
        height="90vh"
        language={language}
        original={original}
        modified={modified}
        theme="vs-dark"
        options={options}
      />
    </div>
  );
}

export default DiffViewer; 