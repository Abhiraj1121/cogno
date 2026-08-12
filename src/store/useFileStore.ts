import { create } from 'zustand';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  mimeType?: string;
  updatedAt: number;
}

interface OSDB extends DBSchema {
  files: {
    key: string;
    value: FileNode;
    indexes: { 'by-parent': string | null };
  };
}

interface FileStore {
  db: IDBPDatabase<OSDB> | null;
  files: Record<string, FileNode>;
  isReady: boolean;

  initDB: () => Promise<void>;
  createFile: (node: Omit<FileNode, 'id' | 'updatedAt'>) => Promise<string>;
  updateFile: (id: string, updates: Partial<FileNode>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  softDeleteFile: (id: string) => Promise<void>;
  resetDB: () => Promise<void>;
  subscribeToChanges: () => void;
}

const DEFAULT_FOLDERS: Omit<FileNode, 'updatedAt'>[] = [
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: null },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: null },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: null },
  { id: 'trash', name: 'Trash', type: 'folder', parentId: null },
];

export const useFileStore = create<FileStore>((set, get) => ({
  db: null,
  files: {},
  isReady: false,

  initDB: async () => {
    const db = await openDB<OSDB>('CognoOS_DB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('by-parent', 'parentId');
      },
    });

    set({ db });

    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const allFiles = await store.getAll();

    if (allFiles.length === 0) {
      const now = Date.now();
      for (const folder of DEFAULT_FOLDERS) {
        await store.add({ ...folder, updatedAt: now } as FileNode);
      }
    }

    await tx.done;

    const finalFiles = await db.getAll('files');
    const filesRecord = finalFiles.reduce((acc, file) => {
      acc[file.id] = file;
      return acc;
    }, {} as Record<string, FileNode>);

    set({ files: filesRecord, isReady: true });
  },

  createFile: async (node) => {
    const { db, files } = get();
    if (!db) throw new Error('DB not initialized');

    const id = crypto.randomUUID();
    const newNode: FileNode = {
      ...node,
      id,
      updatedAt: Date.now(),
    };

    await db.add('files', newNode);
    set({ files: { ...files, [id]: newNode } });
    return id;
  },

  updateFile: async (id, updates) => {
    const { db, files } = get();
    if (!db) throw new Error('DB not initialized');

    const existing = await db.get('files', id);
    if (!existing) throw new Error('File not found');

    const updatedNode = { ...existing, ...updates, updatedAt: Date.now() };
    await db.put('files', updatedNode);
    set({ files: { ...files, [id]: updatedNode } });
  },

  deleteFile: async (id) => {
    const { db, files } = get();
    if (!db) throw new Error('DB not initialized');

    const deleteRecursively = async (nodeId: string) => {
      const allFiles = await db.getAllFromIndex('files', 'by-parent', nodeId);
      for (const file of allFiles) {
        await deleteRecursively(file.id);
      }
      await db.delete('files', nodeId);
    };

    await deleteRecursively(id);

    const finalFiles = await db.getAll('files');
    const filesRecord = finalFiles.reduce((acc, file) => {
      acc[file.id] = file;
      return acc;
    }, {} as Record<string, FileNode>);
    set({ files: filesRecord });
  },

  softDeleteFile: async (id) => {
    await get().updateFile(id, { parentId: 'trash' });
  },

  resetDB: async () => {
    const { db } = get();
    if (db) db.close();

    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('CognoOS_DB');
      req.onsuccess = () => {
        set({ db: null, files: {}, isReady: false });
        get().initDB().then(resolve);
      };
      req.onerror = () => reject(req.error);
      req.onblocked = () => {
        console.warn('DB delete blocked. Close other tabs.');

        window.location.reload();
      };
    });
  },

  subscribeToChanges: () => {
  }
}));
