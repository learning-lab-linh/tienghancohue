"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const PHASE = { FORM: 1, BULK: 2 };

async function uploadImageViaApi(file, setKey) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("setKey", setKey);
  const res = await fetch("/api/upload-firebase", {
    method: "POST",
    body: formData,
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Upload thất bại");
  return payload.url;
}

function parseBulkAnswerTokens(text) {
  const parts = String(text)
    .split(/[,，;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const values = [];
  for (const p of parts) {
    const n = Number.parseInt(p, 10);
    if (!Number.isFinite(n) || n < 1 || n > 4) {
      return {
        error: `Mỗi đáp án phải là 1–4. Không hợp lệ: "${p}"`,
      };
    }
    values.push(String(n));
  }
  return { values };
}

function RowPreview({ src, alt }) {
  if (!src) {
    return (
      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
        Chưa có ảnh
      </div>
    );
  }
  return (
    <div className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain"
        sizes="200px"
      />
    </div>
  );
}

export default function TaoDePage() {
  const [phase, setPhase] = useState(PHASE.FORM);
  const [testType, setTestType] = useState("listen");
  const [setKey, setSetKey] = useState("");
  const [label, setLabel] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const [activeSetKey, setActiveSetKey] = useState("");
  const [activeTestType, setActiveTestType] = useState("listen");
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [bulkHint, setBulkHint] = useState("");
  const [answersBulk, setAnswersBulk] = useState("");
  const [answersBulkError, setAnswersBulkError] = useState("");

  useEffect(() => {
    return () => {
      rows.forEach((r) => {
        if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      });
    };
  }, [rows]);

  const createFramework = async () => {
    if (!setKey.trim() || !label.trim()) {
      setCreateMsg("Nhập mã đề và tên bộ đề.");
      return;
    }
    setCreating(true);
    setCreateMsg("");
    try {
      const response = await fetch("/api/exam-set/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          setKey: setKey.trim(),
          label: label.trim(),
          audioUrl: testType === "listen" ? audioUrl.trim() : "",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Không tạo được khung đề.");

      const qlist = payload.questions || [];
      setActiveSetKey(payload.setKey);
      setActiveTestType(testType);
      const mapped = qlist.map((q) => ({
        id: String(q.id),
        type: q.type || "",
        options: q.options || ["", "", "", ""],
        correctAnswer: String(q.correctAnswer || "1"),
        solution: q.solution || "Đang cập nhật....",
        content: q.content || "",
        file: null,
        previewUrl: null,
      }));
      setRows(mapped);
      setAnswersBulk(mapped.map((r) => r.correctAnswer).join(", "));
      setAnswersBulkError("");
      setPhase(PHASE.BULK);
      setBulkHint("");
      setCreateMsg("Đã tạo khung. Nhập ảnh và đáp án bên dưới.");
    } catch (e) {
      setCreateMsg(e.message);
    } finally {
      setCreating(false);
    }
  };

  const setFileAt = useCallback((index, file) => {
    setRows((prev) => {
      const next = prev.map((r, i) => ({ ...r }));
      const cur = next[index];
      if (cur.previewUrl) URL.revokeObjectURL(cur.previewUrl);
      if (!file) {
        next[index] = { ...cur, file: null, previewUrl: null };
        return next;
      }
      next[index] = {
        ...cur,
        file,
        previewUrl: URL.createObjectURL(file),
      };
      return next;
    });
  }, []);

  const assignBulkImageFiles = useCallback((fileList) => {
    if (!fileList?.length) return;
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      setBulkHint("Không có file ảnh hợp lệ.");
      return;
    }
    images.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
    const count = Math.min(images.length, 50);
    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      for (let i = 0; i < count; i++) {
        const file = images[i];
        if (next[i].previewUrl) URL.revokeObjectURL(next[i].previewUrl);
        next[i] = {
          ...next[i],
          file,
          previewUrl: URL.createObjectURL(file),
        };
      }
      return next;
    });
    if (images.length < 50) {
      setBulkHint(
        `Đã gán ${images.length} ảnh vào câu 1–${images.length} (tên file đã sắp theo số). Còn ${50 - images.length} câu chưa có ảnh trong đợt này.`
      );
    } else if (images.length > 50) {
      setBulkHint(
        `Đã chọn ${images.length} ảnh — chỉ gán 50 ảnh đầu (sau khi sắp tên) cho câu 1–50.`
      );
    } else {
      setBulkHint(
        "Đã gán đủ 50 ảnh theo thứ tự tên file (ví dụ 01.png … 50.png). Kiểm tra preview rồi chọn đáp án."
      );
    }
  }, []);

  const applyBulkAnswers = useCallback(() => {
    setAnswersBulkError("");
    const parsed = parseBulkAnswerTokens(answersBulk);
    if (parsed.error) {
      setAnswersBulkError(parsed.error);
      return;
    }
    let { values } = parsed;

    if (values.length === 0) {
      setAnswersBulkError("Nhập ít nhất một số (1–4).");
      return;
    }

    let hint = "";
    if (values.length > 50) {
      hint = `Đã nhập ${values.length} số — chỉ dùng 50 số đầu cho câu 1–50.`;
      values = values.slice(0, 50);
    }

    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      for (let i = 0; i < next.length; i++) {
        const v = values[i];
        if (v !== undefined) next[i] = { ...next[i], correctAnswer: v };
      }
      return next;
    });

    if (hint) {
      setAnswersBulkError(hint);
    } else if (values.length < 50) {
      setAnswersBulkError(
        `Đã gán ${values.length} đáp án cho câu 1–${values.length}. Còn ${50 - values.length} câu giữ nguyên như trước.`
      );
    } else {
      setAnswersBulkError("");
    }
  }, [answersBulk]);

  const saveAll = async () => {
    if (!activeSetKey || !rows.length) return;
    setSaving(true);
    setSaveMsg("");
    setUploadProgress("");

    try {
      let answerTokens = null;
      const bulk = answersBulk.trim();
      if (bulk) {
        const parsed = parseBulkAnswerTokens(bulk);
        if (parsed.error) throw new Error(parsed.error);
        answerTokens = parsed.values.slice(0, 50);
      }

      const merged = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        let content = r.content || "";
        if (r.file) {
          setUploadProgress(`Đang upload ảnh câu ${r.id}…`);
          content = await uploadImageViaApi(r.file, activeSetKey);
        }
        const correctAnswer =
          answerTokens && answerTokens[i] !== undefined
            ? answerTokens[i]
            : r.correctAnswer;
        merged.push({
          id: r.id,
          type: r.type,
          options: r.options,
          correctAnswer,
          solution: r.solution,
          content,
        });
      }

      setUploadProgress("Đang lưu JSON…");
      const response = await fetch("/api/exam-set/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: activeTestType,
          setKey: activeSetKey,
          questions: merged,
          audioUrl:
            activeTestType === "listen" ? audioUrl.trim() : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Lưu thất bại");

      setRows((prev) =>
        prev.map((r, i) => {
          if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
          return {
            ...r,
            content: merged[i].content,
            correctAnswer: merged[i].correctAnswer,
            file: null,
            previewUrl: null,
          };
        })
      );
      setAnswersBulk(merged.map((m) => m.correctAnswer).join(", "));
      setSaveMsg(payload.message || "Đã lưu.");
      setUploadProgress("");
    } catch (e) {
      setSaveMsg(e.message);
      setUploadProgress("");
    } finally {
      setSaving(false);
    }
  };

  const missingImages = rows.filter((r) => !r.content && !r.file).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white p-4 text-black sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Thêm đề (AI / thủ công)
            </p>
            <h1 className="text-2xl font-bold">Tạo đề mới từ template</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Khung 50 câu copy từ{" "}
              <code className="rounded bg-slate-100 px-1">Listen83</code> hoặc{" "}
              <code className="rounded bg-slate-100 px-1">Reading91</code> (type + 4
              lựa chọn rỗng). Đề <strong>nghe</strong>: sau khi tạo khung, nhập 50 ảnh
              (Firebase) và 50 đáp án; lưu vào <code className="rounded bg-slate-100 px-1">json/</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Trang quản trị
            </Link>
            <Link
              href="/pages/Select"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Trang thi
            </Link>
          </div>
        </header>

        {phase === PHASE.FORM && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Bước 1 — Tạo khung đề</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Loại bài
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                >
                  <option value="listen">Nghe (Listen.json + Listen83 template)</option>
                  <option value="reading">Đọc (Reading.json + Reading91 template)</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Mã đề (setKey)
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  placeholder="Ví dụ: Listen92"
                  value={setKey}
                  onChange={(e) => setSetKey(e.target.value)}
                />
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Tên hiển thị
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  placeholder="Ví dụ: Bộ đề 92"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </label>
              {testType === "listen" && (
                <label className="text-sm font-medium md:col-span-2">
                  URL file nghe (mp3) — lưu kèm khi bấm Lưu ở bước 2
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                    placeholder="https://firebasestorage.googleapis.com/.../file.mp3"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                  />
                </label>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={createFramework}
                disabled={creating}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {creating ? "Đang tạo…" : "Tạo khung 50 câu"}
              </button>
              {createMsg && (
                <p className="text-sm text-slate-700">{createMsg}</p>
              )}
            </div>
          </section>
        )}

        {phase === PHASE.BULK && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Bước 2 — Ảnh & đáp án ({activeTestType === "listen" ? "Nghe" : "Đọc"})
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Bộ đề:{" "}
                  <span className="font-mono font-semibold">{activeSetKey}</span>
                  {missingImages > 0 && (
                    <span className="ml-2 text-amber-700">
                      ({missingImages} câu chưa có ảnh mới hoặc URL)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhase(PHASE.FORM);
                    setRows([]);
                    setCreateMsg("");
                    setSaveMsg("");
                    setBulkHint("");
                    setAnswersBulk("");
                    setAnswersBulkError("");
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Tạo đề khác
                </button>
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {saving ? "Đang xử lý…" : "Upload Firebase & lưu JSON"}
                </button>
              </div>
            </div>

            {(uploadProgress || saveMsg) && (
              <p className="mb-3 text-sm text-slate-700">
                {uploadProgress} {saveMsg}
              </p>
            )}

            <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4">
              <p className="mb-2 text-sm font-semibold text-indigo-900">
                Chọn 50 ảnh một lần
              </p>
              <p className="mb-3 text-xs text-indigo-800/90">
                Ảnh được gán theo thứ tự <strong>tên file</strong> (sắp số tự nhiên: 1, 2,
                … 10). Nên đặt tên <code className="rounded bg-white/80 px-1">01.jpg</code>…
                <code className="rounded bg-white/80 px-1">50.jpg</code> hoặc chọn file theo
                đúng thứ tự câu 1→50 trong hộp thoại hệ thống.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                  Chọn nhiều ảnh (hoặc kéo thả bên dưới)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      assignBulkImageFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {bulkHint && (
                  <span className="max-w-xl text-sm text-indigo-950">{bulkHint}</span>
                )}
              </div>
              <div
                className="mt-3 flex min-h-[88px] items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-white/60 px-4 text-center text-sm text-indigo-900/80"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  assignBulkImageFiles(e.dataTransfer.files);
                }}
              >
                Kéo thả 50 file ảnh vào đây
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <p className="mb-2 text-sm font-semibold text-emerald-900">
                Nhập 50 đáp án (câu 1 → 50)
              </p>
              <p className="mb-2 text-xs text-emerald-900/85">
                Viết các số 1–4, cách nhau bởi dấu phẩy hoặc khoảng trắng. Ví dụ:{" "}
                <code className="rounded bg-white/80 px-1">1, 2, 4, 3, 1, …</code> (đủ 50 số).
                Bấm Áp dụng để gán vào từng câu.
              </p>
              <textarea
                className="mb-2 min-h-[88px] w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-black placeholder:text-slate-400"
                placeholder="1, 2, 4, 3, 1, 2, …"
                value={answersBulk}
                onChange={(e) => {
                  setAnswersBulk(e.target.value);
                  setAnswersBulkError("");
                }}
                spellCheck={false}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={applyBulkAnswers}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                >
                  Áp dụng đáp án
                </button>
                {answersBulkError && (
                  <span
                    className={`text-sm ${
                      answersBulkError.startsWith("Đã gán") ||
                      answersBulkError.startsWith("Đã nhập")
                        ? "text-emerald-900"
                        : "text-rose-700"
                    }`}
                  >
                    {answersBulkError}
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <span>Ảnh câu hỏi &amp; đáp án</span>
                <span className="hidden md:block">Xem nhanh</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {rows.map((r, index) => {
                  const previewSrc = r.previewUrl || r.content || "";
                  return (
                    <li
                      key={r.id}
                      className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          Câu {r.id}{" "}
                          <span className="font-mono text-emerald-800">
                            · Đáp án: {r.correctAnswer}
                          </span>
                        </span>
                        <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100">
                          Chọn ảnh
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setFileAt(index, e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        {r.content && !r.file && (
                          <p className="break-all text-[10px] text-slate-500">
                            {r.content}
                          </p>
                        )}
                      </div>
                      <div className="md:block">
                        <RowPreview src={previewSrc} alt={`Câu ${r.id}`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Ảnh được đưa lên Firebase Storage (đường dẫn{" "}
              <code className="rounded bg-slate-100 px-1">{`{mã đề}/uuid...`}</code>
              ). Lưu cập nhật file{" "}
              <code className="rounded bg-slate-100 px-1">json/Listen.json</code> hoặc{" "}
              <code className="rounded bg-slate-100 px-1">Reading.json</code> và{" "}
              <code className="rounded bg-slate-100 px-1">quiz-sets.json</code> (metadata bộ đề / audio nghe).
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
