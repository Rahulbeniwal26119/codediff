export const SAMPLE_PATCH = `diff --git a/src/user/profile.json b/src/user/profile.json
index 8b13789..b7a92fd 100644
--- a/src/user/profile.json
+++ b/src/user/profile.json
@@ -1,10 +1,12 @@
 {
-  "name": "John Doe",
-  "age": 30,
-  "city": "New York",
-  "hobbies": ["reading", "swimming"],
+  "name": "Jane Doe",
+  "age": 25,
+  "city": "Los Angeles",
+  "hobbies": ["reading", "cycling", "photography"],
   "contact": {
-    "email": "john@example.com",
-    "phone": "555-1234"
-  }
+    "email": "jane@example.com",
+    "phone": "555-5678",
+    "website": "https://jane.dev"
+  },
+  "skills": ["JavaScript", "Python", "React"]
 }
diff --git a/src/components/ProfileCard.jsx b/src/components/ProfileCard.jsx
index 7a91b33..a18d74a 100644
--- a/src/components/ProfileCard.jsx
+++ b/src/components/ProfileCard.jsx
@@ -8,11 +8,17 @@ export default function ProfileCard({ user }) {
   return (
     <article className="profile-card">
       <h2>{user.name}</h2>
-      <p>{user.city}</p>
+      <p className="profile-card__location">{user.city}</p>
+      {user.website && (
+        <a href={user.website} rel="noreferrer" target="_blank">
+          Website
+        </a>
+      )}
       <ul>
         {user.hobbies.map((hobby) => (
           <li key={hobby}>{hobby}</li>
         ))}
       </ul>
+      <SkillList skills={user.skills || []} />
     </article>
   );
 }`;

const emptyStats = () => ({ additions: 0, deletions: 0, files: 0, hunks: 0 });

const stripPatchPath = (path) => {
    if (!path || path === '/dev/null') return path;
    return path.replace(/^(a|b)\//, '');
};

const createFile = (path = 'unknown') => ({
    oldPath: path,
    newPath: path,
    path,
    status: 'modified',
    additions: 0,
    deletions: 0,
    hunks: [],
    metadata: [],
});

const inferStatus = (file) => {
    if (file.oldPath === '/dev/null') return 'added';
    if (file.newPath === '/dev/null') return 'deleted';
    if (file.oldPath && file.newPath && file.oldPath !== file.newPath) return 'renamed';
    return file.status || 'modified';
};

export const parseUnifiedDiff = (patchText = '') => {
    const text = patchText.replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const files = [];
    let currentFile = null;
    let currentHunk = null;
    let oldLineNumber = 0;
    let newLineNumber = 0;

    const finishHunk = () => {
        if (!currentFile || !currentHunk) return;
        currentFile.hunks.push(currentHunk);
        currentHunk = null;
    };

    const finishFile = () => {
        if (!currentFile) return;
        finishHunk();
        currentFile.status = inferStatus(currentFile);
        currentFile.path = currentFile.status === 'deleted'
            ? stripPatchPath(currentFile.oldPath)
            : stripPatchPath(currentFile.newPath || currentFile.oldPath);
        files.push(currentFile);
        currentFile = null;
    };

    lines.forEach((line) => {
        if (line.startsWith('diff --git ')) {
            finishFile();
            const match = line.match(/^diff --git\s+(.+?)\s+(.+)$/);
            const oldPath = stripPatchPath(match?.[1] || 'unknown');
            const newPath = stripPatchPath(match?.[2] || oldPath);
            currentFile = createFile(newPath);
            currentFile.oldPath = oldPath;
            currentFile.newPath = newPath;
            currentFile.metadata.push(line);
            return;
        }

        if (!currentFile && (line.startsWith('--- ') || line.startsWith('+++ ') || line.startsWith('@@ '))) {
            currentFile = createFile();
        }

        if (!currentFile) return;

        if (line.startsWith('new file mode')) {
            currentFile.status = 'added';
            currentFile.metadata.push(line);
            return;
        }

        if (line.startsWith('deleted file mode')) {
            currentFile.status = 'deleted';
            currentFile.metadata.push(line);
            return;
        }

        if (line.startsWith('rename from ')) {
            currentFile.status = 'renamed';
            currentFile.oldPath = line.replace('rename from ', '');
            currentFile.metadata.push(line);
            return;
        }

        if (line.startsWith('rename to ')) {
            currentFile.status = 'renamed';
            currentFile.newPath = line.replace('rename to ', '');
            currentFile.metadata.push(line);
            return;
        }

        if (line.startsWith('--- ')) {
            currentFile.oldPath = stripPatchPath(line.replace('--- ', '').trim());
            currentFile.metadata.push(line);
            return;
        }

        if (line.startsWith('+++ ')) {
            currentFile.newPath = stripPatchPath(line.replace('+++ ', '').trim());
            currentFile.metadata.push(line);
            return;
        }

        if (line.startsWith('@@ ')) {
            finishHunk();
            const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@\s?(.*)$/);
            oldLineNumber = Number(match?.[1] || 0);
            newLineNumber = Number(match?.[3] || 0);
            currentHunk = {
                id: `${files.length}-${currentFile.hunks.length}`,
                header: line,
                section: match?.[5] || '',
                oldStart: Number(match?.[1] || 0),
                oldLines: Number(match?.[2] || 1),
                newStart: Number(match?.[3] || 0),
                newLines: Number(match?.[4] || 1),
                additions: 0,
                deletions: 0,
                lines: [],
            };
            return;
        }

        if (!currentHunk) {
            currentFile.metadata.push(line);
            return;
        }

        const prefix = line[0];
        const content = line.slice(1);

        if (prefix === '+') {
            currentHunk.additions += 1;
            currentFile.additions += 1;
            currentHunk.lines.push({
                type: 'added',
                content,
                oldLineNumber: null,
                newLineNumber,
            });
            newLineNumber += 1;
            return;
        }

        if (prefix === '-') {
            currentHunk.deletions += 1;
            currentFile.deletions += 1;
            currentHunk.lines.push({
                type: 'removed',
                content,
                oldLineNumber,
                newLineNumber: null,
            });
            oldLineNumber += 1;
            return;
        }

        if (prefix === ' ') {
            currentHunk.lines.push({
                type: 'context',
                content,
                oldLineNumber,
                newLineNumber,
            });
            oldLineNumber += 1;
            newLineNumber += 1;
            return;
        }

        if (prefix === '\\') {
            currentHunk.lines.push({
                type: 'meta',
                content: line,
                oldLineNumber: null,
                newLineNumber: null,
            });
        }
    });

    finishFile();

    const stats = files.reduce((acc, file) => {
        acc.files += 1;
        acc.hunks += file.hunks.length;
        acc.additions += file.additions;
        acc.deletions += file.deletions;
        return acc;
    }, emptyStats());

    return {
        files,
        stats,
        isValid: files.length > 0 && files.some(file => file.hunks.length > 0),
    };
};
