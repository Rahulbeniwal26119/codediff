const express = require('express');

const MAX_PATCH_BYTES = 1_500_000;
const ALLOWED_HOSTS = new Set([
    'github.com',
    'patch-diff.githubusercontent.com',
    'raw.githubusercontent.com',
]);

const looksLikePatch = (text) => (
    text.includes('diff --git ')
    || text.startsWith('--- ')
    || text.includes('\n@@ ')
);

const sanitizeCandidates = (candidates = []) => (
    candidates
        .filter(Boolean)
        .map((candidate) => {
            try {
                return new URL(candidate);
            } catch {
                return null;
            }
        })
        .filter((url) => url && ALLOWED_HOSTS.has(url.hostname))
        .slice(0, 4)
);

module.exports = function setupProxy(app) {
    app.use('/api/patch/import/', express.json({ limit: '64kb' }));

    app.post('/api/patch/import/', async (req, res) => {
        const candidates = sanitizeCandidates(req.body?.candidates);

        if (candidates.length === 0) {
            res.status(400).json({ error: 'Unsupported patch URL' });
            return;
        }

        let lastError = null;

        for (const url of candidates) {
            try {
                const response = await fetch(url.toString(), {
                    headers: {
                        Accept: 'text/plain, text/x-diff, text/x-patch',
                        'User-Agent': 'CodeDiff Patch Importer',
                    },
                });

                if (!response.ok) {
                    lastError = `HTTP ${response.status}`;
                    continue;
                }

                const contentLength = Number(response.headers.get('content-length') || 0);
                if (contentLength > MAX_PATCH_BYTES) {
                    lastError = 'Patch is too large';
                    continue;
                }

                const patch = await response.text();
                if (!looksLikePatch(patch)) {
                    lastError = 'Response was not a patch';
                    continue;
                }

                res.json({
                    patch,
                    sourceUrl: url.toString(),
                });
                return;
            } catch (error) {
                lastError = error.message;
            }
        }

        res.status(502).json({
            error: lastError || 'Could not import patch',
        });
    });
};
