const MAX_PATCH_BYTES = 1_500_000;
const ALLOWED_HOSTS = new Set([
    'github.com',
    'patch-diff.githubusercontent.com',
    'raw.githubusercontent.com',
]);

const jsonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
};

const jsonResponse = (body, status = 200) => (
    new Response(JSON.stringify(body), {
        status,
        headers: jsonHeaders,
    })
);

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

export const onRequestOptions = () => (
    new Response(null, {
        status: 204,
        headers: jsonHeaders,
    })
);

export const onRequestPost = async ({ request }) => {
    let body = {};
    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: 'Invalid JSON request body' }, 400);
    }

    const candidates = sanitizeCandidates(body?.candidates);
    if (candidates.length === 0) {
        return jsonResponse({ error: 'Unsupported patch URL' }, 400);
    }

    let lastError = null;
    const attempts = [];

    for (const url of candidates) {
        try {
            const response = await fetch(url.toString(), {
                headers: {
                    Accept: 'text/plain, text/x-diff, text/x-patch',
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

            return jsonResponse({
                patch,
                sourceUrl: url.toString(),
            });
        } catch (error) {
            lastError = error?.message || 'Fetch failed';
            attempts.push(`${url.hostname}: ${lastError}`);
        }
    }

    return jsonResponse({
        error: lastError === 'fetch failed'
            ? 'The patch host could not be reached from the proxy.'
            : lastError || 'Could not import patch',
        attempts,
    }, 502);
};
