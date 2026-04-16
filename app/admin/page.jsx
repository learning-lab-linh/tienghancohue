"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const TEST_TYPES = [
  { value: "listen", label: "Nghe" },
  { value: "reading", label: "Đọc" },
];

const DEFAULT_SETS = {
  listen: [
    "Listen83",
    "Listen1",
    "Listen2",
    "Listen3",
    "Listen4",
    "Listen5",
    "Listen6",
    "Listen7",
    "Listen8",
  ],
  reading: ["Reading83", "De1", "De2", "De3", "De4", "De5", "De6", "De7", "De8"],
};

export default function AdminPage() {
  const [testType, setTestType] = useState("listen");
  const [sets, setSets] = useState([]);
  const [selectedSetKey, setSelectedSetKey] = useState("");
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [createSetMessage, setCreateSetMessage] = useState("");
  const [creatingSet, setCreatingSet] = useState(false);
  const [errorSets, setErrorSets] = useState("");
  const [errorQuestions, setErrorQuestions] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [newSetForm, setNewSetForm] = useState({ setKey: "", label: "", audioUrl: "" });
  const [editForm, setEditForm] = useState({
    type: "",
    content: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
    solution: "",
  });

  useEffect(() => {
    const fetchResults = async () => {
      setLoadingResults(true);
      try {
        const response = await fetch("/api/results?limit=30");
        const payload = await response.json();
        setResults(payload.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    };
    fetchResults();
  }, []);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setErrorSets("");
        const response = await fetch(`/api/sets?testType=${testType}`);
        const payload = await response.json();
        const nextSets =
          Array.isArray(payload.data) && payload.data.length
            ? payload.data
            : DEFAULT_SETS[testType].map((setKey, idx) => ({
                setKey,
                label: setKey,
                displayOrder: idx + 1,
              }));
        setSets(nextSets);
        setSelectedSetKey(nextSets[0]?.setKey || "");
      } catch (error) {
        const fallbackSets = DEFAULT_SETS[testType].map((setKey, idx) => ({
          setKey,
          label: setKey,
          displayOrder: idx + 1,
        }));
        setErrorSets("Không tải được danh sách bộ đề, đang dùng dữ liệu mặc định.");
        setSets(fallbackSets);
        setSelectedSetKey(fallbackSets[0]?.setKey || "");
        console.error("Lỗi tải bộ đề:", error);
      }
    };
    fetchSets();
  }, [testType]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedSetKey) return;
      setLoadingQuestions(true);
      try {
        setErrorQuestions("");
        const response = await fetch(
          `/api/questions?testType=${testType}&setKey=${selectedSetKey}`
        );
        const payload = await response.json();
        setQuestions(payload.data || []);
      } catch (error) {
        setErrorQuestions("Không tải được danh sách câu hỏi.");
        setQuestions([]);
        console.error("Lỗi tải câu hỏi:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [testType, selectedSetKey]);

  const hydrate = useCallback(
    (questionId, source = questions) => {
      const target = source.find((q) => String(q.id) === String(questionId));
      if (!target) return;
      setEditForm({
        type: target.type || "",
        content: target.content || "",
        option1: target.options?.[0] || "",
        option2: target.options?.[1] || "",
        option3: target.options?.[2] || "",
        option4: target.options?.[3] || "",
        correctAnswer: target.correctAnswer || "",
        solution: target.solution || "",
      });
      setSaveMessage("");
    },
    [questions]
  );

  useEffect(() => {
    if (!questions.length) return setSelectedQuestionId("");
    const id = String(questions[0].id);
    setSelectedQuestionId(id);
    hydrate(id, questions);
  }, [questions, hydrate]);

  const saveQuestion = async () => {
    if (!selectedQuestionId || !selectedSetKey) return;
    setSavingQuestion(true);
    setSaveMessage("");
    try {
      const response = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          setKey: selectedSetKey,
          setNumber: 0,
          id: Number(selectedQuestionId),
          type: editForm.type,
          content: editForm.content,
          options: [editForm.option1, editForm.option2, editForm.option3, editForm.option4],
          correctAnswer: editForm.correctAnswer,
          solution: editForm.solution,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Lưu thất bại");
      setSaveMessage("Đã lưu thay đổi.");
    } catch (error) {
      setSaveMessage(error.message);
    } finally {
      setSavingQuestion(false);
    }
  };

  const createSet = async () => {
    if (!newSetForm.setKey || !newSetForm.label) return;
    setCreatingSet(true);
    setCreateSetMessage("");
    try {
      const response = await fetch("/api/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType, ...newSetForm }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Tạo đề thất bại");
      setCreateSetMessage("Đã tạo đề mới.");
      const reload = await fetch(`/api/sets?testType=${testType}`);
      const rePayload = await reload.json();
      setSets(rePayload.data || []);
      setSelectedSetKey(newSetForm.setKey);
      setNewSetForm({ setKey: "", label: "", audioUrl: "" });
    } catch (error) {
      setCreateSetMessage(error.message);
    } finally {
      setCreatingSet(false);
    }
  };

  const isImageUrl = (value) => {
    if (!value || typeof value !== "string") return false;
    const normalized = value.trim();
    return (
      /^https?:\/\//i.test(normalized) ||
      /^\/uploads\/.+/i.test(normalized) ||
      /^data:image\//i.test(normalized)
    );
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Upload thất bại");
      }

      setEditForm((prev) => ({ ...prev, content: payload.url }));
      setUploadMessage("Đã upload ảnh và điền URL vào nội dung.");
    } catch (error) {
      setUploadMessage(error.message || "Không thể upload ảnh.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const totalSets = sets.length;
  const totalQuestions = questions.length;
  const recentResults = results.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white p-4 text-black sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Bảng điều khiển quản trị
              </p>
              <h1 className="text-3xl font-bold">Trang quản trị</h1>
              <p className="mt-1 text-sm text-slate-600">
                Quản lý bộ đề, ảnh câu hỏi và đáp án trong cùng một nơi.
              </p>
            </div>
            <Link
              href="/pages/Select"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-slate-100"
            >
              Quay lại trang thi
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Bộ đề</p>
              <p className="mt-1 text-2xl font-bold">{totalSets}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Câu hỏi</p>
              <p className="mt-1 text-2xl font-bold">{totalQuestions}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Kết quả gần đây</p>
              <p className="mt-1 text-2xl font-bold">{recentResults}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Lịch sử kết quả</h2>
          {loadingResults ? (
            <p className="text-sm text-slate-600">Đang tải...</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-2 text-left">Loại bài</th>
                    <th className="px-3 py-2 text-left">Bộ đề</th>
                    <th className="px-3 py-2 text-left">Điểm</th>
                    <th className="px-3 py-2 text-left">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-2">{r.testType}</td>
                      <td className="px-3 py-2">{r.setNumber}</td>
                      <td className="px-3 py-2 font-semibold">{r.score}</td>
                      <td className="px-3 py-2">{r.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-3">
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-black"
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
            >
              {TEST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-black"
              value={selectedSetKey}
              onChange={(e) => setSelectedSetKey(e.target.value)}
            >
              {!selectedSetKey && <option value="">Chọn bộ đề</option>}
              {sets.map((s) => (
                <option key={s.setKey} value={s.setKey}>
                  {s.label} ({s.setKey})
                </option>
              ))}
            </select>
          </div>
          {errorSets && <p className="mb-3 text-sm font-medium text-rose-700">{errorSets}</p>}

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold">Tạo bộ đề mới</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-black placeholder:text-gray-500"
                placeholder="Mã đề (setKey)"
                value={newSetForm.setKey}
                onChange={(e) => setNewSetForm((p) => ({ ...p, setKey: e.target.value }))}
              />
              <input
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-black placeholder:text-gray-500"
                placeholder="Tên bộ đề"
                value={newSetForm.label}
                onChange={(e) => setNewSetForm((p) => ({ ...p, label: e.target.value }))}
              />
              <input
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-black placeholder:text-gray-500"
                placeholder="Đường dẫn audio (chỉ nghe)"
                value={newSetForm.audioUrl}
                onChange={(e) =>
                  setNewSetForm((p) => ({ ...p, audioUrl: e.target.value }))
                }
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={createSet}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                {creatingSet ? "Đang tạo..." : "Tạo bộ đề"}
              </button>
              {createSetMessage && <p className="text-sm">{createSetMessage}</p>}
            </div>
          </div>

          {loadingQuestions ? (
            <p className="text-sm text-slate-600">Đang tải câu hỏi...</p>
          ) : errorQuestions ? (
            <p className="text-sm font-medium text-rose-700">{errorQuestions}</p>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
              <div className="max-h-[620px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuestionId(String(q.id));
                      hydrate(q.id);
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                      String(q.id) === String(selectedQuestionId)
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold">Câu {q.id}</p>
                    {q.type ? (
                      <p className="mt-1 line-clamp-2 text-slate-600">{q.type}</p>
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3">
                  <label className="text-sm font-medium">
                    Mô tả câu hỏi
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm text-black placeholder:text-gray-500"
                      rows={2}
                      placeholder="Nhóm câu hỏi / mô tả loại câu"
                      value={editForm.type}
                      onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                    />
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-black transition hover:bg-slate-100">
                        {uploadingImage ? "Đang upload..." : "Upload ảnh"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadImage}
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadMessage && <span className="text-sm">{uploadMessage}</span>}
                    </div>
                    {isImageUrl(editForm.content) && (
                      <div className="mt-3 overflow-hidden rounded-lg border bg-white p-2">
                        <Image
                          src={editForm.content}
                          alt="Xem trước ảnh câu hỏi"
                          width={800}
                          height={500}
                          unoptimized
                          className="max-h-80 w-auto rounded object-contain"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-xs text-slate-600">
                      URL ảnh sẽ được cập nhật tự động sau khi upload.
                    </p>
                  </div>
                  <label className="text-sm font-medium">
                    Đáp án đúng
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-black placeholder:text-gray-500"
                      placeholder="Ví dụ: 1, 2, 3, 4"
                      value={editForm.correctAnswer}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, correctAnswer: e.target.value }))
                      }
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Hướng dẫn giải
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-black placeholder:text-gray-500"
                      placeholder="Nhập hướng dẫn giải"
                      value={editForm.solution}
                      onChange={(e) => setEditForm((p) => ({ ...p, solution: e.target.value }))}
                    />
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={saveQuestion}
                      disabled={savingQuestion}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {savingQuestion ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    {saveMessage && <p className="text-sm">{saveMessage}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


// build22