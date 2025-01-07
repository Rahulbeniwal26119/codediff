import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ value, onChange, title }) {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div className="editor-container">
      <h2>{title}</h2>
      <Editor
        height="500px"
        defaultLanguage="javascript"
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}

export default CodeEditor; 