const isPlainObject = (value) => (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
);

const getType = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
};

const valuesEqual = (left, right) => {
    if (Object.is(left, right)) return true;
    if (isPlainObject(left) || isPlainObject(right) || Array.isArray(left) || Array.isArray(right)) {
        return JSON.stringify(left) === JSON.stringify(right);
    }
    return false;
};

const joinPath = (base, key) => {
    if (!base) return String(key);
    return `${base}.${key}`;
};

const compareJson = (before, after, path = '', changes = []) => {
    const beforeType = getType(before);
    const afterType = getType(after);

    if (beforeType !== afterType) {
        changes.push({
            type: 'type',
            path: path || '$',
            beforeType,
            afterType,
            before,
            after,
        });
        return changes;
    }

    if (Array.isArray(before)) {
        if (before.length !== after.length) {
            changes.push({
                type: 'arrayLength',
                path: path || '$',
                before: before.length,
                after: after.length,
            });
        }

        const maxLength = Math.max(before.length, after.length);
        for (let index = 0; index < maxLength; index += 1) {
            const itemPath = `${path || '$'}[${index}]`;
            if (index >= before.length) {
                changes.push({ type: 'added', path: itemPath, after: after[index] });
            } else if (index >= after.length) {
                changes.push({ type: 'removed', path: itemPath, before: before[index] });
            } else {
                compareJson(before[index], after[index], itemPath, changes);
            }
        }
        return changes;
    }

    if (isPlainObject(before)) {
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
        [...keys].sort().forEach((key) => {
            const nextPath = joinPath(path, key);
            const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
            const hasAfter = Object.prototype.hasOwnProperty.call(after, key);

            if (!hasBefore) {
                changes.push({ type: 'added', path: nextPath, after: after[key] });
            } else if (!hasAfter) {
                changes.push({ type: 'removed', path: nextPath, before: before[key] });
            } else {
                compareJson(before[key], after[key], nextPath, changes);
            }
        });
        return changes;
    }

    if (!valuesEqual(before, after)) {
        changes.push({
            type: 'changed',
            path: path || '$',
            before,
            after,
        });
    }

    return changes;
};

const parseJson = (value) => {
    try {
        return {
            valid: true,
            value: JSON.parse(value),
            error: null,
        };
    } catch (error) {
        return {
            valid: false,
            value: null,
            error: error.message,
        };
    }
};

export const getJsonSemanticSummary = (beforeText, afterText) => {
    const before = parseJson(beforeText);
    const after = parseJson(afterText);

    if (!before.valid || !after.valid) {
        return {
            valid: false,
            beforeValid: before.valid,
            afterValid: after.valid,
            beforeError: before.error,
            afterError: after.error,
            changes: [],
            counts: {
                added: 0,
                removed: 0,
                changed: 0,
                type: 0,
                arrayLength: 0,
                total: 0,
            },
        };
    }

    const changes = compareJson(before.value, after.value);
    const counts = changes.reduce((acc, change) => {
        acc[change.type] = (acc[change.type] || 0) + 1;
        acc.total += 1;
        return acc;
    }, {
        added: 0,
        removed: 0,
        changed: 0,
        type: 0,
        arrayLength: 0,
        total: 0,
    });

    return {
        valid: true,
        beforeValid: true,
        afterValid: true,
        beforeError: null,
        afterError: null,
        changes,
        counts,
    };
};
