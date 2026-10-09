import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, Auth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  Firestore 
} from "firebase/firestore";
import { TuItem, QcStatus } from "../types";

declare global {
  interface Window {
    VERCEL_ENV_VARS?: {
      FIREBASE_API_KEY?: string;
      FIREBASE_AUTH_DOMAIN?: string;
      FIREBASE_PROJECT_ID?: string;
      FIREBASE_STORAGE_BUCKET?: string;
      FIREBASE_MESSAGING_SENDER_ID?: string;
      FIREBASE_APP_ID?: string;
    };
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let currentAppId = "mgps-qc-tracker-app";

export const getFirebaseConfig = () => {
  const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;
  const vercel = window.VERCEL_ENV_VARS || {};

  const customConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || vercel.FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || vercel.FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || vercel.FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || vercel.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || vercel.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || vercel.FIREBASE_APP_ID
  };

  if (customConfig && customConfig.apiKey) {
    return customConfig;
  }

  if (typeof window.__firebase_config !== "undefined" && window.__firebase_config) {
    try {
      return JSON.parse(window.__firebase_config);
    } catch (e) {
      return null;
    }
  }

  return null;
};

const getPublicCollection = () => collection(dbInstance!, 'artifacts', currentAppId, 'public', 'data', 'tu_items');
const getPublicDoc = (docId: string) => doc(dbInstance!, 'artifacts', currentAppId, 'public', 'data', 'tu_items', docId);

export const initFirebaseDB = async (
  onDataUpdate: (items: any[]) => void,
  onError?: (error: any) => void
): Promise<(() => void) | null> => {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey) {
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    currentAppId = config.projectId || (window.__app_id || 'mgps-qc-tracker-app');

    const initialAuthToken = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
    if (initialAuthToken) {
      await signInWithCustomToken(authInstance, initialAuthToken);
    } else {
      await signInAnonymously(authInstance);
    }

    const unsubscribe = onSnapshot(getPublicCollection(), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnapshot) => {
        items.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      onDataUpdate(items);
    }, (error) => {
      console.error("Firestore Snapshot Listener Error:", error);
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Firebase Auth / Connection Error:", err);
    if (onError) onError(err);
    return null;
  }
};

export const FirebaseOps = {
  saveItem: async (item: TuItem) => {
    if (!authInstance?.currentUser || !dbInstance) return;
    const ref = getPublicDoc(item.id);
    await setDoc(ref, item, { merge: true });
  },

  updateItem: async (id: string, fields: Partial<TuItem>) => {
    if (!authInstance?.currentUser || !dbInstance) return;
    const ref = getPublicDoc(id);
    await updateDoc(ref, { ...fields, updatedAt: new Date().toISOString() });
  },

  deleteItem: async (id: string) => {
    if (!authInstance?.currentUser || !dbInstance) return;
    const ref = getPublicDoc(id);
    await deleteDoc(ref);
  },

  saveBatch: async (items: TuItem[]) => {
    if (!authInstance?.currentUser || !dbInstance || !items.length) return;
    const CHUNK_SIZE = 200;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(dbInstance);
      chunk.forEach(item => {
        const ref = getPublicDoc(item.id);
        batch.set(ref, item, { merge: true });
      });
      await batch.commit();
    }
  },

  updateBatchStatus: async (ids: string[], newStatus: QcStatus) => {
    if (!authInstance?.currentUser || !dbInstance || !ids.length) return;
    const CHUNK_SIZE = 200;
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(dbInstance);
      chunk.forEach(id => {
        const ref = getPublicDoc(id);
        batch.update(ref, { status: newStatus, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  },

  clearAll: async (items: TuItem[]) => {
    if (!authInstance?.currentUser || !dbInstance || !items.length) return;
    const CHUNK_SIZE = 200;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(dbInstance);
      chunk.forEach(item => {
        const ref = getPublicDoc(item.id);
        batch.delete(ref);
      });
      await batch.commit();
    }
  }
};
