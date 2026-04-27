import { initializeApp, getApps } from "firebase/app";
import { deleteObject, getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB76Ub46X7vvhLtm-wlJJKCcUJLayQpGsE",
  authDomain: "upload-9ece2.firebaseapp.com",
  databaseURL: "https://upload-9ece2-default-rtdb.firebaseio.com",
  projectId: "upload-9ece2",
  storageBucket: "upload-9ece2.appspot.com",
  messagingSenderId: "325278410225",
  appId: "1:325278410225:web:0c46096221261a144f1050",
  measurementId: "G-3K35F9BDQ8",
};

const FIREBASE_DOWNLOAD_HOST = "firebasestorage.googleapis.com";
const FIREBASE_BUCKET = "upload-9ece2.appspot.com";

function getStorageApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
}

function extractObjectPathFromFirebaseUrl(url) {
  if (!url || typeof url !== "string") return "";
  const value = url.trim();
  if (!value) return "";
  try {
    const parsed = new URL(value);
    if (parsed.hostname !== FIREBASE_DOWNLOAD_HOST) return "";
    const marker = `/v0/b/${FIREBASE_BUCKET}/o/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return "";
    const encodedObjectPath = parsed.pathname.slice(idx + marker.length);
    if (!encodedObjectPath) return "";
    return decodeURIComponent(encodedObjectPath);
  } catch {
    return "";
  }
}

export async function deleteFirebaseFilesByUrls(urls) {
  const uniquePaths = [
    ...new Set(
      (urls || [])
        .map((url) => extractObjectPathFromFirebaseUrl(url))
        .filter(Boolean)
    ),
  ];
  if (!uniquePaths.length) {
    return { deleted: [], failed: [] };
  }

  const app = getStorageApp();
  const storage = getStorage(app);
  const deleted = [];
  const failed = [];

  for (const objectPath of uniquePaths) {
    try {
      await deleteObject(ref(storage, objectPath));
      deleted.push(objectPath);
    } catch (error) {
      failed.push({
        objectPath,
        reason: error?.message || "Delete Firebase failed",
      });
    }
  }

  return { deleted, failed };
}
