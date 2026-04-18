import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function getStorageApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const setKey = String(formData.get("setKey") || "").trim();

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Thiếu file." }, { status: 400 });
    }
    if (!setKey) {
      return NextResponse.json({ error: "Thiếu setKey." }, { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Chỉ chấp nhận ảnh." }, { status: 400 });
    }

    const safeSet = setKey.replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext =
      (file.name?.includes(".") ? file.name.split(".").pop() : "jpg") || "jpg";
    const safeExt = /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toLowerCase() : "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());

    const app = getStorageApp();
    const storage = getStorage(app);
    const objectPath = `${safeSet}/${uuidv4()}.${safeExt}`;
    const storageRef = ref(storage, objectPath);

    await uploadBytes(storageRef, buffer, {
      contentType: file.type || "image/jpeg",
    });
    const url = await getDownloadURL(storageRef);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("upload-firebase:", error);
    return NextResponse.json(
      { error: error.message || "Upload Firebase thất bại." },
      { status: 500 }
    );
  }
}
