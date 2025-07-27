import { openDB, DBSchema } from 'idb';

interface FileEntry {
    path: string;
    type: 'file' | 'dir';
    content?: string;
    children?: string[];
    readOnly?: boolean;
    githubUrl?: string; // for /System files
}

interface FSDB extends DBSchema {
    files: {
        key: string;
        value: FileEntry;
    };
}

const DB_NAME = 'htmlos-fs';
const DB_VERSION = 1;

let dbPromise: ReturnType<typeof openDB<FSDB>> | null = null;

export async function fsInit() {
    if (!dbPromise) {
        dbPromise = openDB<FSDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                db.createObjectStore('files', { keyPath: 'path' });
            },
        });
    }
}

const GITHUB_REPO = 'denis0001-dev/HtmlOS';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/git/trees/main?recursive=1`;

async function fetchSystemTree() {
    const res = await fetch(GITHUB_API);
    if (!res.ok) throw new Error('Failed to fetch GitHub tree');
    const data = await res.json();
    return data.tree;
}

async function ensureSystemDir(path: string) {
    // path: /System or /System/subdir...
    const db = await dbPromise!;
    const entry = await db.get('files', path);
    if (entry) return entry;
    // Fetch the full tree from GitHub (one-time, then cache)
    const tree = await fetchSystemTree();
    // Build directory structure in IndexedDB
    const dirMap: Record<string, FileEntry> = {};
    for (const item of tree) {
        const fullPath = '/System/' + item.path;
        if (item.type === 'tree') {
            dirMap[fullPath] = dirMap[fullPath] || { path: fullPath, type: 'dir', children: [], readOnly: true };
            // Add to parent
            const parent = fullPath.substring(0, fullPath.lastIndexOf('/')) || '/System';
            dirMap[parent] = dirMap[parent] || { path: parent, type: 'dir', children: [], readOnly: true };
            if (!dirMap[parent].children!.includes(fullPath)) dirMap[parent].children!.push(fullPath);
        } else if (item.type === 'blob') {
            // File
            dirMap[fullPath] = {
                path: fullPath,
                type: 'file',
                content: undefined,
                readOnly: true,
                githubUrl: item.url,
            };
            // Add to parent
            const parent = fullPath.substring(0, fullPath.lastIndexOf('/')) || '/System';
            dirMap[parent] = dirMap[parent] || { path: parent, type: 'dir', children: [], readOnly: true };
            if (!dirMap[parent].children!.includes(fullPath)) dirMap[parent].children!.push(fullPath);
        }
    }
    // Store all dirs/files in IndexedDB
    for (const entry of Object.values(dirMap)) {
        await db.put('files', entry);
    }
    return await db.get('files', path);
}

export async function fsList(path: string): Promise<string[]> {
    const db = await dbPromise!;
    if (path === '/') {
        // List /System and all user-created files/dirs at root
        const dbFiles = await db.getAll('files');
        const userRoot = dbFiles.filter(f => f.path.startsWith('/') && f.path.split('/').length === 2 && f.path !== '/System');
        return ['System', ...userRoot.map(f => f.path.slice(1))];
    }
    let entry = await db.get('files', path);
    if (!entry && path.startsWith('/System')) {
        entry = await ensureSystemDir(path);
    }
    if (!entry || entry.type !== 'dir') throw new Error('Not a directory');
    return entry.children || [];
}

export async function fsRead(path: string): Promise<string> {
    const db = await dbPromise!;
    let entry = await db.get('files', path);
    if (!entry && path.startsWith('/System')) {
        // Try to ensure the directory structure exists
        await ensureSystemDir(path.substring(0, path.lastIndexOf('/')) || '/System');
        entry = await db.get('files', path);
    }
    if (!entry || entry.type !== 'file') throw new Error('Not a file');
    if (entry.content !== undefined) return entry.content;
    // If /System file and not cached, fetch from GitHub
    if (path.startsWith('/System') && entry.githubUrl) {
        const fileRes = await fetch(entry.githubUrl, {
            headers: { 'Accept': 'application/vnd.github.v3.raw' },
        });
        const content = await fileRes.text();
        entry.content = content;
        await db.put('files', entry);
        return content;
    }
    throw new Error('File not found');
}

export async function fsWrite(path: string, content: string): Promise<void> {
    const db = await dbPromise!;
    const entry = await db.get('files', path);
    if (entry && entry.readOnly) throw new Error('Read-only file');
    if (entry && entry.type !== 'file') throw new Error('Not a file');
    await db.put('files', { path, type: 'file', content });
}

export async function fsExists(path: string): Promise<boolean> {
    const db = await dbPromise!;
    return !!(await db.get('files', path));
}

export async function fsIsDir(path: string): Promise<boolean> {
    const db = await dbPromise!;
    let entry = await db.get('files', path);
    if (!entry && path.startsWith('/System')) {
        entry = await ensureSystemDir(path);
    }
    return (!!entry && entry.type === 'dir') || path == "/";
} 