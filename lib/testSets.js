export const LISTEN_SET_MAP = {
  1: { key: "Listen83", label: "Bộ đề 83" },
  2: { key: "Listen1", label: "Bộ đề 1" },
  3: { key: "Listen2", label: "Bộ đề 2" },
  4: { key: "Listen3", label: "Bộ đề 3" },
  5: { key: "Listen4", label: "Bộ đề 4" },
  6: { key: "Listen5", label: "Bộ đề 5" },
  7: { key: "Listen6", label: "Bộ đề 6" },
  8: { key: "Listen7", label: "Bộ đề 7" },
  9: { key: "Listen8", label: "Bộ đề 91" },
};

export const READING_SET_MAP = {
  1: { key: "Reading83", label: "Bộ đề 83" },
  2: { key: "De1", label: "Bộ đề 1" },
  3: { key: "De2", label: "Bộ đề 2" },
  4: { key: "De3", label: "Bộ đề 3" },
  5: { key: "De4", label: "Bộ đề 4" },
  6: { key: "De5", label: "Bộ đề 5" },
  7: { key: "De6", label: "Bộ đề 6" },
  8: { key: "De7", label: "Bộ đề 7" },
  9: { key: "De8", label: "Bộ đề 91" },
};

/** URL mp3 mặc định — key trùng với key trong Listen.json (tránh nhầm với số thứ tự UI) */
export const LISTEN_AUDIO_BY_SET_KEY = {
  Listen83:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen83%2F%5BLISTENING%20TOPIK%2083%5D%20TOPIK%20%E1%84%83%E1%85%B3%E1%86%AE%E1%84%80%E1%85%B5%2083%E1%84%92%E1%85%AC%20_%20%E1%84%92%E1%85%A1%E1%86%AB%E1%84%80%E1%85%AE%E1%86%A8%E1%84%8B%E1%85%A5%E1%84%82%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A7%E1%86%A8%E1%84%89%E1%85%B5%E1%84%92%E1%85%A5%E1%86%B7%20%E1%84%83%E1%85%B3%E1%86%AE%E1%84%80%E1%85%B5%20%E1%84%8C%E1%85%B5%E1%84%86%E1%85%AE%E1%86%AB%20-%20BA%CC%80I%20NGHE%20TOPIK%20II%20ke%CC%80m%20phu%CC%A3%20%C4%91e%CC%82%CC%80.mp3?alt=media&token=0f332054-0c96-42ed-ba28-7bd54b68d23b",
  Listen1:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen1%2FListen1.mp3?alt=media&token=6f84d7bd-dd08-4742-9fb4-01b89f04efc7",
  Listen2:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen2%2FListen2.mp3?alt=media&token=33c06ab8-fd9e-4b66-bafc-7772c28680ed",
  Listen3:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen3%2FListen3.mp3?alt=media&token=42619370-76c5-424c-bab8-cdb34616c30d",
  Listen4:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen4%2FListen4.mp3?alt=media&token=9f71dbe8-b466-4656-9de7-44766f83afd0",
  Listen5:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen5%2FListen5.mp3?alt=media&token=e7f57b99-2fe7-476b-9484-9172d51cc2b0",
  Listen6:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen6%2FNGHE6.mp3?alt=media&token=b8361427-b33f-4637-9cf8-494a456d8f96",
  Listen7:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen7%2Fnghe7.mp3?alt=media&token=ed10fc69-8489-44fb-9dd6-c76e09bb760a",
  Listen91:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen8%2Fnghe8.mp3?alt=media&token=ccd4c62d-bdfb-492b-b43e-dd42d67211ed",
    Listen102:
    "https://firebasestorage.googleapis.com/v0/b/upload-9ece2.appspot.com/o/Listen102%2Flisten102.mp3?alt=media&token=99c73c94-6164-41ee-acfc-62a64e3ac4f4",
};

export function getSetKey(testType, setNumber) {
  const map = testType === "listen" ? LISTEN_SET_MAP : READING_SET_MAP;
  const target = map[Number(setNumber)] || map[1];
  return target.key;
}
