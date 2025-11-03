import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCode } from '../context/CodeContext';
import { hasLanguageTemplate } from '../utils/languageTemplates';
import CodeEditor from './CodeEditor';
import Controls from './Controls';

const LanguagePage = () => {
    const { language } = useParams();
    const navigate = useNavigate();
    const { selectedLanguage, setSelectedLanguage, loadLanguageTemplate, supportedLanguages } = useCode();

    useEffect(() => {
        // Validate the language parameter
        if (language) {
            const normalizedLang = language.toLowerCase();
            
            // Check if the language is supported
            if (supportedLanguages.includes(normalizedLang)) {
                setSelectedLanguage(normalizedLang);
                loadLanguageTemplate(normalizedLang);
                
                // Update page title and meta for SEO
                document.title = `${language.toUpperCase()} Code Diff Tool - Compare ${language.toUpperCase()} Code`;
                
                // Update meta description
                const metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    metaDescription.setAttribute('content', 
                        `Professional ${language.toUpperCase()} code comparison tool. Compare, analyze, and visualize differences in ${language.toUpperCase()} code with syntax highlighting and side-by-side view.`
                    );
                }
            } else {
                // Redirect to home if language is not supported
                navigate('/', { replace: true });
            }
        }
    }, [language, navigate, setSelectedLanguage, loadLanguageTemplate, supportedLanguages]);

    // Update SEO meta tags
    useEffect(() => {
        if (selectedLanguage) {
            const langName = selectedLanguage.toUpperCase();
            
            // Update canonical URL
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
                canonical.setAttribute('href', `https://codediff.takovibe.com/${selectedLanguage}-diff`);
            } else {
                const newCanonical = document.createElement('link');
                newCanonical.rel = 'canonical';
                newCanonical.href = `https://codediff.takovibe.com/${selectedLanguage}-diff`;
                document.head.appendChild(newCanonical);
            }
            
            // Update Open Graph tags
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                ogTitle.setAttribute('content', `${langName} Code Diff Tool - Compare ${langName} Code Online`);
            } else {
                ogTitle = document.createElement('meta');
                ogTitle.setAttribute('property', 'og:title');
                ogTitle.setAttribute('content', `${langName} Code Diff Tool - Compare ${langName} Code Online`);
                document.head.appendChild(ogTitle);
            }
            
            let ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) {
                ogDescription.setAttribute('content', 
                    `Professional ${langName} code comparison tool with syntax highlighting, side-by-side view, and inline differences. Perfect for code reviews and debugging.`
                );
            } else {
                ogDescription = document.createElement('meta');
                ogDescription.setAttribute('property', 'og:description');
                ogDescription.setAttribute('content', 
                    `Professional ${langName} code comparison tool with syntax highlighting, side-by-side view, and inline differences. Perfect for code reviews and debugging.`
                );
                document.head.appendChild(ogDescription);
            }
            
            let ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) {
                ogUrl.setAttribute('content', `https://codediff.takovibe.com/${selectedLanguage}-diff`);
            } else {
                ogUrl = document.createElement('meta');
                ogUrl.setAttribute('property', 'og:url');
                ogUrl.setAttribute('content', `https://codediff.takovibe.com/${selectedLanguage}-diff`);
                document.head.appendChild(ogUrl);
            }
        }
    }, [selectedLanguage]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Language-specific header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {selectedLanguage ? `${selectedLanguage.toUpperCase()} Code Diff Tool` : 'Code Diff Tool'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {selectedLanguage ? 
                            `Compare and analyze ${selectedLanguage.toUpperCase()} code with professional diff visualization` :
                            'Compare and analyze code with professional diff visualization'
                        }
                    </p>
                </div>
                
                {/* Controls */}
                <Controls />
                
                {/* Code Editor */}
                <CodeEditor />
                
                {/* Language-specific information */}
                {selectedLanguage && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                            About {selectedLanguage.toUpperCase()} Code Comparison
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            This tool provides advanced {selectedLanguage.toUpperCase()} code comparison with syntax highlighting, 
                            intelligent diff algorithms, and multiple viewing modes. Perfect for code reviews, debugging, 
                            and understanding code changes in {selectedLanguage.toUpperCase()} projects.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LanguagePage;