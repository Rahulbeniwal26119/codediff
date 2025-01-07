import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

function DiffViewer({ original, modified, language }) {
  const options = {
    renderSideBySide: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    diffWordWrap: 'on',
    lineHeight: 24,
    padding: { top: 16 },
    diffEditor: {
      renderSideBySide: true,
      enableSplitViewResizing: true,
      ignoreTrimWhitespace: false,
      renderIndicators: true,
      originalEditable: false,
      renderMarginRevertIcon: true
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