const fs = require('fs');
const http = require('http');
const path = require('path');

const BUILD_DIR = path.resolve(process.env.BUILD_DIR || path.join(__dirname, 'build'));
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3001);
const BACKEND_API_URL = (process.env.BACKEND_API_URL || 'https://backend.takovibe.com').replace(/\/$/, '');
const MAX_PATCH_BYTES = 1_500_000;
const MAX_PROXY_BODY_BYTES = 5_000_000;
const ALLOWED_PATCH_HOSTS = new Set([
    'github.com',
    'patch-diff.githubusercontent.com',
    'raw.githubusercontent.com',
]);

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml; charset=utf-8',
};

const jsonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
};

const sendJson = (res, status, body) => {
    res.writeHead(status, jsonHeaders);
    res.end(JSON.stringify(body));
};

const readRequestBody = (req, maxBytes = MAX_PROXY_BODY_BYTES) => new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxBytes) {
            reject(new Error('Request body too large'));
            req.destroy();
            return;
        }
        chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
});

const readRequestJson = (req) => new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 64 * 1024) {
            reject(new Error('Request body too large'));
            req.destroy();
        }
    });

    req.on('end', () => {
        try {
            resolve(body ? JSON.parse(body) : {});
        } catch {
            reject(new Error('Invalid JSON request body'));
        }
    });

    req.on('error', reject);
});

const looksLikePatch = (text) => (
    text.includes('diff --git ')
    || text.startsWith('--- ')
    || text.includes('\n@@ ')
);

const sanitizePatchCandidates = (candidates = []) => (
    candidates
        .filter(Boolean)
        .map((candidate) => {
            try {
                return new URL(candidate);
            } catch {
                return null;
            }
        })
        .filter((url) => url && ALLOWED_PATCH_HOSTS.has(url.hostname))
        .slice(0, 4)
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

const handlePatchImport = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, jsonHeaders);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
    }

    let body;
    try {
        body = await readRequestJson(req);
    } catch (error) {
        sendJson(res, 400, { error: error.message });
        return;
    }

    const candidates = sanitizePatchCandidates(body.candidates);
    if (candidates.length === 0) {
        sendJson(res, 400, { error: 'Unsupported patch URL' });
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

            sendJson(res, 200, {
                patch,
                sourceUrl: url.toString(),
            });
            return;
        } catch (error) {
            lastError = error.name === 'AbortError'
                ? 'Patch host timed out'
                : error.message || 'Fetch failed';
            attempts.push(`${url.hostname}: ${lastError}`);
        }
    }

    sendJson(res, 502, {
        error: lastError === 'fetch failed'
            ? 'The patch host could not be reached from the server.'
            : lastError || 'Could not import patch',
        attempts,
    });
};

const proxyBackendApi = async (req, res, requestUrl) => {
    try {
        const body = req.method === 'GET' || req.method === 'HEAD'
            ? undefined
            : await readRequestBody(req);

        const backendUrl = `${BACKEND_API_URL}${requestUrl.pathname}${requestUrl.search}`;
        const response = await fetchWithTimeout(backendUrl, {
            method: req.method,
            headers: {
                Accept: req.headers.accept || 'application/json',
                'Content-Type': req.headers['content-type'] || 'application/json',
            },
            body,
        }, 15000);

        const headers = {};
        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                headers[key] = value;
            }
        });

        headers['Access-Control-Allow-Origin'] = '*';
        const responseBody = Buffer.from(await response.arrayBuffer());
        res.writeHead(response.status, headers);
        res.end(responseBody);
    } catch (error) {
        sendJson(res, 502, {
            error: error.name === 'AbortError'
                ? 'Backend API timed out'
                : error.message || 'Backend API request failed',
        });
    }
};

const getSafeFilePath = (pathname) => {
    const decodedPath = decodeURIComponent(pathname);
    const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(BUILD_DIR, normalizedPath);

    if (!filePath.startsWith(BUILD_DIR)) {
        return null;
    }

    return filePath;
};

const serveFile = (res, filePath, method) => {
    fs.stat(filePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            serveFile(res, path.join(BUILD_DIR, 'index.html'), method);
            return;
        }

        const ext = path.extname(filePath);
        const headers = {
            'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': filePath.includes(`${path.sep}static${path.sep}`)
                ? 'public, max-age=31536000, immutable'
                : 'no-cache',
        };

        res.writeHead(200, headers);

        if (method === 'HEAD') {
            res.end();
            return;
        }

        fs.createReadStream(filePath).pipe(res);
    });
};

const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

    if (requestUrl.pathname === '/healthz') {
        sendJson(res, 200, { ok: true });
        return;
    }

    if (requestUrl.pathname === '/api/patch/import') {
        await handlePatchImport(req, res);
        return;
    }

    if (requestUrl.pathname.startsWith('/api/code-diff')) {
        if (req.method === 'OPTIONS') {
            res.writeHead(204, jsonHeaders);
            res.end();
            return;
        }

        await proxyBackendApi(req, res, requestUrl);
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
    }

    const filePath = getSafeFilePath(requestUrl.pathname);
    if (!filePath) {
        sendJson(res, 400, { error: 'Invalid path' });
        return;
    }

    serveFile(res, filePath, req.method);
});

server.listen(PORT, HOST, () => {
    console.log(`CodeDiff production server listening on http://${HOST}:${PORT}`);
    console.log(`Serving build from ${BUILD_DIR}`);
});

server.on('error', (error) => {
    console.error('CodeDiff production server failed to start:', error);
    process.exit(1);
});
