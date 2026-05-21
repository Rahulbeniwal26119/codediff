const languageKeywords = {
    python: [
        'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
        'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
        'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
        'raise', 'return', 'try', 'while', 'with', 'yield',
    ],
    javascript: [
        'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
        'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'from', 'function',
        'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch',
        'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    ],
    typescript: [
        'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
        'continue', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends',
        'finally', 'for', 'from', 'function', 'if', 'implements', 'import', 'in',
        'interface', 'let', 'namespace', 'new', 'private', 'protected', 'public',
        'readonly', 'return', 'static', 'super', 'switch', 'this', 'throw', 'try',
        'type', 'typeof', 'var', 'void', 'while', 'with',
    ],
    json: ['true', 'false', 'null'],
    css: ['important'],
    default: [
        'break', 'case', 'class', 'const', 'continue', 'def', 'else', 'false', 'for',
        'function', 'if', 'import', 'let', 'null', 'return', 'true', 'var', 'while',
    ],
};

const tokenPatterns = {
    python: /(#.*|"""(?:[^"\\]|\\.|\n)*?"""|'''(?:[^'\\]|\\.|\n)*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|@[A-Za-z_]\w*|\b[A-Za-z_]\w*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:;+\-*/%=<>!&|^~]+)/g,
    javascript: /(\/\/.*|\/\*.*?\*\/|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:;+\-*/%=<>!&|^~?]+)/g,
    typescript: /(\/\/.*|\/\*.*?\*\/|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:;+\-*/%=<>!&|^~?]+)/g,
    json: /("(?:[^"\\]|\\.)*"\s*:|"(?:[^"\\]|\\.)*"|\btrue\b|\bfalse\b|\bnull\b|-?\b\d+(?:\.\d+)?\b|[{}[\]:,])/g,
    css: /(\/\*.*?\*\/|#[0-9a-fA-F]{3,8}\b|--[\w-]+|[.#]?[A-Za-z_-][\w-]*(?=\s*[:{,(])|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%|s|ms)?\b|[{}()[\]:;,>+~*=])/g,
    default: /(\/\/.*|#.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b[A-Za-z_]\w*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:;+\-*/%=<>!&|^~?]+)/g,
};

const languageAliases = {
    jsx: 'javascript',
    tsx: 'typescript',
    markdown: 'default',
    yaml: 'default',
    shell: 'default',
    ruby: 'default',
    php: 'default',
    java: 'default',
    go: 'default',
    rust: 'default',
    cpp: 'default',
    csharp: 'default',
};

const getLanguageKey = (language = '') => {
    const normalized = language.toLowerCase();
    return languageAliases[normalized] || normalized;
};

const classifyToken = (token, language) => {
    const keywords = languageKeywords[language] || languageKeywords.default;

    if (!token) return 'plain';
    if (/^(#|\/\/|\/\*)/.test(token)) return 'comment';
    if (/^(['"`])/.test(token)) return 'string';
    if (language === 'json' && /^"(?:[^"\\]|\\.)*"\s*:$/.test(token)) return 'property';
    if (/^["']/.test(token)) return 'string';
    if (/^-?\d/.test(token)) return 'number';
    if (/^@[A-Za-z_]/.test(token)) return 'decorator';
    if (keywords.includes(token)) return 'keyword';
    if (/^[A-Z][A-Za-z0-9_]*$/.test(token)) return 'type';
    if (/^[A-Za-z_$][\w$]*$/.test(token)) return 'function';
    if (/^[{}()[\].,:;+\-*/%=<>!&|^~?]+$/.test(token)) return 'punctuation';
    return 'plain';
};

export const getSyntaxTokens = (code = '', language = '') => {
    const languageKey = getLanguageKey(language);
    const pattern = tokenPatterns[languageKey] || tokenPatterns.default;
    const tokens = [];
    let cursor = 0;

    pattern.lastIndex = 0;

    for (const match of code.matchAll(pattern)) {
        const value = match[0];
        const index = match.index || 0;

        if (index > cursor) {
            tokens.push({ text: code.slice(cursor, index), type: 'plain' });
        }

        tokens.push({
            text: value,
            type: classifyToken(value, languageKey),
        });
        cursor = index + value.length;
    }

    if (cursor < code.length) {
        tokens.push({ text: code.slice(cursor), type: 'plain' });
    }

    return tokens.length ? tokens : [{ text: code || ' ', type: 'plain' }];
};
