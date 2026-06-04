import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

class LocalFileStore {
  private dbName = "ForenClueOfflineFiles";
  private storeName = "files";
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async saveFile(key: string, file: Blob): Promise<string> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put(file, key);
        request.onsuccess = () => {
          resolve(`localdb://${key}`);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to save to local IndexedDB:", err);
      // Absolute fallback to direct base64 if IndexedDB fails entirely
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  async getFile(key: string): Promise<Blob | null> {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const cleanedKey = key.replace("localdb://", "");
        const request = store.get(cleanedKey);
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          console.error("IndexedDB getFile error:", request.error);
          resolve(null);
        };
      });
    } catch (err) {
      console.error("IndexedDB not accessible in getFile:", err);
      return null;
    }
  }
}

export const localFileStore = new LocalFileStore();

// Dynamic timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = "Operation timed out"): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

async function uploadToServerDisk(file: File, onStatusChange?: (msg: string) => void): Promise<string> {
  if (onStatusChange) onStatusChange('Routing upload safely to High-Performance Server storage...');
  const base64Data = await convertToBase64(file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      base64Data: base64Data
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server side upload pipeline rejected: ${text || response.statusText}`);
  }

  const data = await response.json();
  if (data && data.url) {
    return data.url;
  }
  throw new Error('Malformed server file-upload response');
}

/**
 * Resilient upload utility that tries Cloud Storage with a fail-fast timeout,
 * falls back to our Express server uploads disk, and ultimately falls back to IndexedDB.
 */
export async function uploadFileResilient(
  file: File, 
  cloudPath: string, 
  onStatusChange?: (msg: string) => void
): Promise<{ url: string; isFallback: boolean }> {
  
  if (storage) {
    try {
      if (onStatusChange) onStatusChange('Attempting secure upload to Firebase Cloud Storage...');
      const fileRef = ref(storage, cloudPath);
      
      // Attempt Firebase Storage upload with a strict 4.5-second timeout
      const uploadTask = uploadBytes(fileRef, file);
      const snapshot = await withTimeout(uploadTask, 4500, "Firebase Cloud Storage took too long to respond.");
      
      const getUrlTask = getDownloadURL(snapshot.ref);
      const downloadUrl = await withTimeout(getUrlTask, 3000, "Firebase URL retrieval timeout.");
      
      return { url: downloadUrl, isFallback: false };
    } catch (err: any) {
      console.warn("Cloud storage upload rejected or timed out. Handing off to Express server disk layer:", err);
    }
  } else {
    console.warn("Firebase Storage is not initialized in firebase.ts. Resorting to Express server disk layer.");
  }

  // Fallback 1: High-performance shared Server Disk storage
  try {
    const serverUrl = await uploadToServerDisk(file, onStatusChange);
    return { url: serverUrl, isFallback: false };
  } catch (serverErr) {
    console.warn("Express server disk write failed or rejected. Resorting to fallback local IndexedDB database:", serverErr);
  }

  // Fallback 2: Local IndexedDB (strictly browser-local offline sandbox)
  if (onStatusChange) onStatusChange('Switching to local browser sandbox database (IndexedDB)...');
  
  // Create a clean key for IndexedDB
  const uniqueId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const localUrl = await localFileStore.saveFile(uniqueId, file);
  
  return { url: localUrl, isFallback: true };
}

/**
 * Resolves any localdb:// URL or Base64 string to a usable web URL for images.
 */
export async function resolveFileUrl(url: string | null | undefined): Promise<string> {
  if (!url) return '';
  if (url.startsWith('localdb://')) {
    const blob = await localFileStore.getFile(url);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    // Return a beautiful fallback if not present in DB
    return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300';
  }
  return url;
}

export function ResilientImage({ src, alt, className, ...props }: { src: string; alt: string; className?: string; [key: string]: any }) {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const resolve = async () => {
      if (!src) return;
      if (src.startsWith('localdb://')) {
        const url = await resolveFileUrl(src);
        if (active) {
          setResolvedSrc(url);
          objectUrl = url;
        }
      } else {
        if (active) {
          setResolvedSrc(src);
        }
      }
    };

    resolve();

    return () => {
      active = false;
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!resolvedSrc) {
    return <div className={className ? className + " animate-pulse bg-black/5 dark:bg-white/5" : "animate-pulse bg-black/5 dark:bg-white/5 rounded-lg w-full h-full"} />;
  }

  return (
    <img src={resolvedSrc} alt={alt} className={className} referrerPolicy="no-referrer" {...props} />
  );
}

