"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/lib/firebaseConfig";

export function getFirebaseAuth() {
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getAuth(app);
}
