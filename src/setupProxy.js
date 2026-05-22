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

const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
};

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
    app.use('/api/patch/import', express.json({ limit: '64kb' }));

    app.post('/api/patch/import', async (req, res) => {
        const candidates = sanitizeCandidates(req.body?.candidates);

        if (candidates.length === 0) {
            res.status(400).json({ error: 'Unsupported patch URL' });
            return;
        }

        let lastError = null;
        const attempts = [];

        for (const url of candidates) {
            try {
                const response = await fetchWithTimeout(url.toString(), {
                    headers: {
                        Accept: 'text/plain, text/x-diff, text/x-patch',
                        'User-Agent': 'CodeDiff Patch Importer',
                    },
                });

                if (!response.ok) {
                    lastError = `HTTP ${response.status}`;
                    attempts.push(`${url.hostname}: ${lastError}`);
                    continue;
                }

                const contentLength = Number(response.headers.get('content-length') || 0);
                if (contentLength > MAX_PATCH_BYTES) {
                    lastError = 'Patch is too large';
                    attempts.push(`${url.hostname}: ${lastError}`);
                    continue;
                }

                const patch = await response.text();
                if (!looksLikePatch(patch)) {
                    lastError = 'Response was not a patch';
                    attempts.push(`${url.hostname}: ${lastError}`);
                    continue;
                }

                res.json({
                    patch,
                    sourceUrl: url.toString(),
                });
                return;
            } catch (error) {
                lastError = error.name === 'AbortError'
                    ? 'Patch host timed out'
                    : error.message;
                attempts.push(`${url.hostname}: ${lastError}`);
            }
        }

        res.status(502).json({
            error: lastError === 'fetch failed'
                ? 'The patch host could not be reached from the proxy.'
                : lastError || 'Could not import patch',
            attempts,
        });
    });
};
