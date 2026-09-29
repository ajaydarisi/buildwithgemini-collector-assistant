import { Message } from "../types/chat";

const DB_NAME = "CollectorAssistantDB";
const STORE_NAME = "chat_history";
const DB_VERSION = 1;
const STORAGE_KEY = "current_session_messages";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMessagesToStorage(messages: Message[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(messages, STORAGE_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to persist messages to IndexedDB:", err);
  }
}

export async function loadMessagesFromStorage(): Promise<Message[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STORAGE_KEY);

      req.onsuccess = () => {
        const result = req.result;
        if (!result || !Array.isArray(result)) {
          return resolve(null);
        }

        // Restore serialized date strings into Date objects
        const hydrated: Message[] = result.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        resolve(hydrated);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to load messages from IndexedDB:", err);
    return null;
  }
}

export async function clearMessagesFromStorage(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(STORAGE_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to clear messages from IndexedDB:", err);
  }
}
