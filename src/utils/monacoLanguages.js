// Monaco Editor language mappings
// Some of our language names need to be mapped to Monaco's language identifiers

export const getMonacoLanguageId = (language) => {
    const languageMap = {
        'javascript': 'javascript',
        'json': 'json',
        'python': 'python',
        'java': 'java',
        'typescript': 'typescript',
        'html': 'html',
        'css': 'css',
        'xml': 'xml',
        'yaml': 'yaml',
        'php': 'php',
        'ruby': 'ruby',
        'go': 'go',
        'rust': 'rust',
        'sql': 'sql',
        'shell': 'shell',
        'csharp': 'csharp',
        'cpp': 'cpp',
        'kotlin': 'kotlin',
        'swift': 'swift',
        'dart': 'dart',
        'scala': 'scala',
        'r': 'r',
        'powershell': 'powershell',
        'haskell': 'haskell',
        'objective-c': 'objective-c',
        'clojure': 'clojure',
        'elixir': 'elixir',
        'fsharp': 'fsharp',
        'lua': 'lua',
        'perl': 'perl'
    };

    return languageMap[language.toLowerCase()] || 'plaintext';
};

// Get display name for language (capitalize first letter)
export const getLanguageDisplayName = (language) => {
    const displayNames = {
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'json': 'JSON',
        'html': 'HTML',
        'css': 'CSS',
        'xml': 'XML',
        'yaml': 'YAML',
        'sql': 'SQL',
        'php': 'PHP',
        'java': 'Java',
        'python': 'Python',
        'go': 'Go',
        'rust': 'Rust',
        'ruby': 'Ruby',
        'shell': 'Shell',
        'csharp': 'C#',
        'cpp': 'C++',
        'kotlin': 'Kotlin',
        'swift': 'Swift',
        'dart': 'Dart',
        'scala': 'Scala',
        'r': 'R',
        'powershell': 'PowerShell',
        'haskell': 'Haskell',
        'objective-c': 'Objective-C',
        'clojure': 'Clojure',
        'elixir': 'Elixir',
        'fsharp': 'F#',
        'lua': 'Lua',
        'perl': 'Perl'
    };

    return displayNames[language.toLowerCase()] || language.toUpperCase();
};