import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserYaml from 'prettier/plugins/yaml';

const getParser = (lang) => {
    switch (lang) {
        case 'javascript':
        case 'typescript':
            return 'babel';
        case 'json':
            return 'json';
        case 'html':
        case 'xml':
            return 'html';
        case 'css':
        case 'scss':
        case 'less':
            return 'css';
        case 'yaml':
            return 'yaml';
        default:
            return null;
    }
};

const getPlugins = (lang) => {
    switch (lang) {
        case 'javascript':
        case 'typescript':
        case 'json':
            return [parserBabel, parserEstree];
        case 'html':
        case 'xml':
            return [parserHtml];
        case 'css':
        case 'scss':
        case 'less':
            return [parserPostcss];
        case 'yaml':
            return [parserYaml];
        default:
            return [];
    }
};

export const formatCode = async (code, language) => {
    if (!code) return '';

    // Native JSON formatting for reliability
    if (language === 'json') {
        try {
            const parsed = JSON.parse(code);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            throw new Error('Invalid JSON');
        }
    }

    const parser = getParser(language);
    const plugins = getPlugins(language);

    if (!parser) {
        throw new Error(`Formatting not supported for ${language}`);
    }

    return await prettier.format(code, {
        parser,
        plugins,
        printWidth: 80,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
    });
};

export const canFormatLanguage = (language) => {
    return !!getParser(language);
};
