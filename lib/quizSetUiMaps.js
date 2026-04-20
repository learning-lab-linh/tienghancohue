/** Ánh xạ số thứ tự UI (setNumber) → key + nhãn — dùng client & server (không đọc file). */

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

export function getSetKey(testType, setNumber) {
  const map = testType === "listen" ? LISTEN_SET_MAP : READING_SET_MAP;
  const target = map[Number(setNumber)] || map[1];
  return target.key;
}

export function getSetLabel(testType, setNumber) {
  const map = testType === "listen" ? LISTEN_SET_MAP : READING_SET_MAP;
  const target = map[Number(setNumber)] || map[1];
  return target.label;
}
