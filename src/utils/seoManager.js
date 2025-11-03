// SEO utilities for CodeDiff app

class SEOManager {
    constructor() {
        this.defaultMeta = {
            title: 'CodeDiff - Advanced Code Comparison Tool',
            description: 'Compare, analyze, and visualize code differences with our powerful online diff tool. Support for multiple languages, syntax highlighting, and real-time collaboration.',
            keywords: 'code diff, code comparison, diff tool, code analysis, programming, developer tools, syntax highlighting',
            author: 'Rahul Beniwal',
            robots: 'index, follow',
            canonical: window.location.origin,
        };
        this.init();
    }

    init() {
        this.setupDefaultMeta();
        this.setupStructuredData();
        this.setupOpenGraph();
        this.setupTwitterCard();
    }

    setupDefaultMeta() {
        this.setTitle(this.defaultMeta.title);
        this.setMetaTag('description', this.defaultMeta.description);
        this.setMetaTag('keywords', this.defaultMeta.keywords);
        this.setMetaTag('author', this.defaultMeta.author);
        this.setMetaTag('robots', this.defaultMeta.robots);
        this.setLinkTag('canonical', this.defaultMeta.canonical);
    }

    setTitle(title) {
        document.title = title;
    }

    setMetaTag(name, content) {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', name);
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
    }

    setMetaProperty(property, content) {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('property', property);
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
    }

    setLinkTag(rel, href) {
        let linkTag = document.querySelector(`link[rel="${rel}"]`);
        if (!linkTag) {
            linkTag = document.createElement('link');
            linkTag.setAttribute('rel', rel);
            document.head.appendChild(linkTag);
        }
        linkTag.setAttribute('href', href);
    }

    setupOpenGraph() {
        this.setMetaProperty('og:title', this.defaultMeta.title);
        this.setMetaProperty('og:description', this.defaultMeta.description);
        this.setMetaProperty('og:type', 'website');
        this.setMetaProperty('og:url', window.location.href);
        this.setMetaProperty('og:site_name', 'CodeDiff');
        this.setMetaProperty('og:locale', 'en_US');
    }

    setupTwitterCard() {
        this.setMetaTag('twitter:card', 'summary_large_image');
        this.setMetaTag('twitter:title', this.defaultMeta.title);
        this.setMetaTag('twitter:description', this.defaultMeta.description);
        // this.setMetaTag('twitter:creator', '@codediff');
    }

    setupStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CodeDiff",
            "description": this.defaultMeta.description,
            "url": window.location.origin,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "featureList": [
                "Side-by-side code comparison",
                "Syntax highlighting for multiple languages",
                "Real-time diff visualization",
                "Export and share capabilities",
                "Dark and light themes",
                "Mobile responsive design"
            ]
        };

        this.addStructuredData(structuredData);
    }

    addStructuredData(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    updateForDiff(language, diffId) {
        const title = `${language} Code Diff - ${diffId} | CodeDiff`;
        const description = `Compare and analyze ${language} code differences. View detailed diff analysis with syntax highlighting and advanced comparison features.`;
        
        this.setTitle(title);
        this.setMetaTag('description', description);
        
        // Update Open Graph
        this.setMetaProperty('og:title', title);
        this.setMetaProperty('og:description', description);
        this.setMetaProperty('og:url', window.location.href);
        
        // Update Twitter Card
        this.setMetaTag('twitter:title', title);
        this.setMetaTag('twitter:description', description);
        
        // Update canonical URL
        this.setLinkTag('canonical', window.location.href);

        // Add language-specific structured data
        const diffStructuredData = {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": `${language} Code Diff - ${diffId}`,
            "description": description,
            "url": window.location.href,
            "programmingLanguage": language,
            "author": {
                "@type": "Person",
                "name": "Rahul Beniwal"
            },
            "dateCreated": new Date().toISOString(),
            "isAccessibleForFree": true
        };

        this.addStructuredData(diffStructuredData);
    }

    updateForLanguage(language) {
        const languageNames = {
            'json': 'JSON',
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'php': 'PHP',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'typescript': 'TypeScript',
            'html': 'HTML',
            'css': 'CSS',
            'xml': 'XML',
            'yaml': 'YAML',
            'sql': 'SQL',
            'shell': 'Shell'
        };

        const languageDisplayName = languageNames[language] || language.toUpperCase();
        const title = `${languageDisplayName} Code Diff Tool | Online ${languageDisplayName} Code Comparison`;
        const description = `Professional ${languageDisplayName} code diff tool. Compare, analyze and visualize ${languageDisplayName} code differences online with syntax highlighting, side-by-side view, and advanced diff algorithms.`;
        
        this.setTitle(title);
        this.setMetaTag('description', description);
        this.setMetaTag('keywords', `${language} diff, ${language} code comparison, ${languageDisplayName} diff tool, code analyzer, ${language} syntax highlighting, online diff, code comparison tool`);
        
        // Update Open Graph
        this.setMetaProperty('og:title', title);
        this.setMetaProperty('og:description', description);
        this.setMetaProperty('og:url', window.location.href);
        
        // Update Twitter Card
        this.setMetaTag('twitter:title', title);
        this.setMetaTag('twitter:description', description);
        
        // Update canonical URL
        this.setLinkTag('canonical', window.location.href);

        // Add language-specific structured data
        const languageStructuredData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": `${languageDisplayName} Code Diff Tool`,
            "description": description,
            "url": window.location.href,
            "applicationCategory": "DeveloperApplication",
            "programmingLanguage": languageDisplayName,
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "featureList": [
                `${languageDisplayName} syntax highlighting`,
                "Side-by-side comparison",
                "Real-time diff visualization",
                "Export and share capabilities",
                "Mobile responsive design"
            ],
            "author": {
                "@type": "Organization",
                "name": "CodeDiff"
            }
        };

        this.addStructuredData(languageStructuredData);
    }

    generateSitemap() {
        // This would typically be done server-side
        // But we can provide the structure for it
        return {
            urls: [
                {
                    loc: window.location.origin,
                    changefreq: 'daily',
                    priority: 1.0
                },
                {
                    loc: `${window.location.origin}/about`,
                    changefreq: 'monthly',
                    priority: 0.8
                },
                {
                    loc: `${window.location.origin}/features`,
                    changefreq: 'monthly',
                    priority: 0.8
                }
            ]
        };
    }

    addBreadcrumbs(breadcrumbs) {
        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };

        this.addStructuredData(breadcrumbData);
    }

    trackPageView() {
        // Basic page view tracking
        if ('gtag' in window) {
            window.gtag('config', 'GA_TRACKING_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    preloadCriticalResources() {
        // Preload critical resources
        const criticalResources = [
            { href: '/static/css/main.css', as: 'style' },
            { href: '/static/js/main.js', as: 'script' },
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }

    optimizeImages() {
        // Add lazy loading to images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    }
}

// Create singleton instance
const seoManager = new SEOManager();

// Export utility functions
export const updateSEOForDiff = (language, diffId) => 
    seoManager.updateForDiff(language, diffId);

export const updateSEOForLanguage = (language) => 
    seoManager.updateForLanguage(language);

export const addBreadcrumbs = (breadcrumbs) => 
    seoManager.addBreadcrumbs(breadcrumbs);

export const trackPageView = () => 
    seoManager.trackPageView();

export const preloadResources = () => 
    seoManager.preloadCriticalResources();

export const optimizeImages = () => 
    seoManager.optimizeImages();

export default seoManager;