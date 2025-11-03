const fs = require('fs');
const path = require('path');

const generateSitemap = () => {
    const baseURL = 'https://codediff.takovibe.com';
    const currentDate = new Date().toISOString();
    
    const languages = [
        'json', 'javascript', 'python', 'java',
        'php', 'ruby', 'go', 'rust', 'typescript', 'html', 
        'css', 'xml', 'yaml', 'sql', 'shell', 'csharp', 'cpp',
        'kotlin', 'swift', 'dart', 'scala', 'r', 'powershell', 'haskell'
    ];

    const urls = [
        {
            loc: baseURL,
            changefreq: 'daily',
            priority: '1.0',
            lastmod: currentDate
        }
    ];

    // Add language-specific pages
    languages.forEach(lang => {
        urls.push({
            loc: `${baseURL}/${lang}-diff`,
            changefreq: 'weekly',
            priority: '0.9',
            lastmod: currentDate
        });
    });

    // Generate XML sitemap
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    return sitemapXML;
};

// Generate robots.txt
const generateRobotsTxt = () => {
    const baseURL = 'https://codediff.takovibe.com';
    
    const languages = [
        'json', 'javascript', 'python', 'java',
        'php', 'ruby', 'go', 'rust', 'typescript', 'html', 
        'css', 'xml', 'yaml', 'sql', 'shell'
    ];
    
    const languageAllowRules = languages.map(lang => `Allow: /${lang}-diff`).join('\n');
    
    return `User-agent: *
Allow: /

# Language-specific diff pages
${languageAllowRules}

# Disallow admin or private paths if any
# Disallow: /admin/
# Disallow: /api/

Sitemap: ${baseURL}/sitemap.xml
`;
};

// Write files
const outputDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write sitemap.xml
fs.writeFileSync(
    path.join(outputDir, 'sitemap.xml'),
    generateSitemap(),
    'utf8'
);

// Write robots.txt
fs.writeFileSync(
    path.join(outputDir, 'robots.txt'),
    generateRobotsTxt(),
    'utf8'
);

console.log('✅ Sitemap and robots.txt generated successfully!');
console.log(`📍 Files created in: ${outputDir}`);

module.exports = {
    generateSitemap,
    generateRobotsTxt
};