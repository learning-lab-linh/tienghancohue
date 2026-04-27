"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Headphones,
  HelpCircle,
  ImageIcon,
  LayoutList, 
  Loader2,
  Save,
  Type,
} from "lucide-react";

const ALLOWED = ["listen", "reading"];

function isImageUrl(value) {
  if (!value || typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    /^https?:\/\//i.test(normalized) ||
    /^\/uploads\/.+/i.test(normalized) ||
    /^data:image\//i.test(normalized)
  );
}

function Panel({ title, icon: Icon, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white shadow-sm ring-1 ring-black/[0.04] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 sm:px-5">
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default function AdminBoDeSetDetailPage() {
  const params = useParams();
  const rawType = String(params?.testType ?? "");
  const rawKey = String(params?.setKey ?? "");
  const testType = ALLOWED.includes(rawType) ? rawType : null;
  const setKey = rawKey.trim();

  const [setMeta, setSetMeta] = useState({ label: "", audioUrl: "" });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorQuestions, setErrorQuestions] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [audioDraft, setAudioDraft] = useState("");
  const [savingAudio, setSavingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
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
    if (!testType || !setKey) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/sets?testType=${testType}`);
        const j = await res.json().catch(() => ({}));
        const row = Array.isArray(j.data)
          ? j.data.find((s) => s.setKey === setKey)
          : null;
        if (!cancelled) {
          setSetMeta({
            label: row?.label || setKey,
            audioUrl: row?.audioUrl || "",
          });
          setAudioDraft(row?.audioUrl || "");
        }
      } catch {
        if (!cancelled) {
          setSetMeta({ label: setKey, audioUrl: "" });
          setAudioDraft("");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testType, setKey]);

  useEffect(() => {
    if (!testType || !setKey) return;
    let cancelled = false;
    (async () => {
      setLoadingQuestions(true);
      setErrorQuestions("");
      try {
        const response = await fetch(
          `/api/questions?testType=${testType}&setKey=${encodeURIComponent(setKey)}`
        );
        const payload = await response.json();
        if (cancelled) return;
        setQuestions(payload.data || []);
      } catch {
        if (!cancelled) {
          setErrorQuestions("Không tải được danh sách câu hỏi.");
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testType, setKey]);

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
    if (!questions.length) {
      setSelectedQuestionId("");
      return;
    }
    const id = String(questions[0].id);
    setSelectedQuestionId(id);
    hydrate(id, questions);
  }, [questions, hydrate]);

  const saveQuestion = async () => {
    if (!selectedQuestionId || !setKey || !testType) return;
    setSavingQuestion(true);
    setSaveMessage("");
    try {
      const response = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          setKey,
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
      setSaveMessage("Đã lưu thành công.");
      const reload = await fetch(
        `/api/questions?testType=${testType}&setKey=${encodeURIComponent(setKey)}`
      );
      const rj = await reload.json();
      setQuestions(rj.data || []);
    } catch (error) {
      setSaveMessage(error.message);
    } finally {
      setSavingQuestion(false);
    }
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
      if (!response.ok) throw new Error(payload.error || "Upload thất bại");
      setEditForm((prev) => ({ ...prev, content: payload.url }));
      setUploadMessage("Đã gắn URL ảnh vào nội dung.");
    } catch (error) {
      setUploadMessage(error.message || "Không thể upload ảnh.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const selectedIndex = useMemo(() => {
    const i = questions.findIndex((q) => String(q.id) === String(selectedQuestionId));
    return i >= 0 ? i + 1 : 0;
  }, [questions, selectedQuestionId]);

  if (!testType || !setKey) notFound();

  const isListen = testType === "listen";

  const saveOk = Boolean(saveMessage && saveMessage.includes("thành công"));

  const saveAudioUrl = async () => {
    if (!isListen || !testType || !setKey || savingAudio) return;
    setSavingAudio(true);
    setAudioMessage("");
    try {
      const response = await fetch("/api/sets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          setKey,
          audioUrl: audioDraft.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Lưu link audio thất bại.");
      }
      setSetMeta((prev) => ({ ...prev, audioUrl: audioDraft.trim() }));
      setAudioMessage("Đã cập nhật link audio.");
    } catch (error) {
      setAudioMessage(error.message || "Không thể lưu link audio.");
    } finally {
      setSavingAudio(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/bo-de"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-900 hover:bg-zinc-100 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Danh sách bộ đề
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-zinc-500 sm:text-sm"
          aria-label="Breadcrumb"
        >
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-800">
            Bộ đề
          </span>
          <ChevronRight className="mx-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-800">
            {isListen ? (
              <Headphones className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
            ) : (
              <BookOpen className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
            )}
            {isListen ? "Nghe" : "Đọc"}
          </span>
          <ChevronRight className="mx-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="font-mono text-black">{setKey}</span>
        </nav>
      </div>

      {/* <header className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                {isListen ? (
                  <>
                    <Headphones className="h-3.5 w-3.5" />
                    Nghe
                  </>
                ) : (
                  <>
                    <BookOpen className="h-3.5 w-3.5" />
                    Đọc
                  </>
                )}
              </span>
              <span className="rounded-full border border-zinc-300 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                {setKey}
              </span>
            </div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-black sm:text-3xl">
              {setMeta.label}
            </h1>
            {isListen && setMeta.audioUrl ? (
              <a
                href={setMeta.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-black underline decoration-zinc-400 underline-offset-4 hover:decoration-black"
              >
                <span className="truncate">Mở file audio</span>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
              </a>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <div className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center shadow-sm sm:min-w-[140px]">
              <p className="text-2xl font-bold tabular-nums text-black">
                {loadingQuestions ? "—" : questions.length}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Câu hỏi
              </p>
            </div>
          </div>
        </div>
      </header> */}

      {loadingQuestions ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_1fr]">
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 sm:grid-cols-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-200" aria-hidden />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-48 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />
          </div>
        </div>
      ) : errorQuestions ? (
        <div
          role="alert"
          className="rounded-2xl border border-zinc-800 bg-zinc-100 px-4 py-3 text-sm text-zinc-900"
        >
          {errorQuestions}
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)] xl:items-start">
          <aside className="space-y-3 xl:sticky xl:top-20 xl:max-h-[calc(100vh-5.5rem)] xl:self-start">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-white shadow-md">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <LayoutList className="h-4 w-4 text-zinc-400" aria-hidden />
                Danh sách câu
              </span>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium tabular-nums">
                {questions.length}
              </span>
            </div>
            <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-2 shadow-inner xl:max-h-[calc(100vh-11rem)]">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {questions.map((q) => {
                  const active = String(q.id) === String(selectedQuestionId);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      title={q.type ? String(q.type) : `Câu ${q.id}`}
                      onClick={() => {
                        setSelectedQuestionId(String(q.id));
                        hydrate(q.id);
                      }}
                      className={`flex min-h-[1.25rem] flex-col items-center justify-start rounded-xl border px-1 py-2 text-center transition ${
                        active
                          ? "border-zinc-900 bg-white shadow-sm ring-2 ring-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-400"
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase leading-none text-zinc-500">
                        Câu
                      </span>
                      <span className="mt-0.5 text-base font-bold tabular-nums leading-none text-black sm:text-lg">
                        {q.id}
                      </span>
                      {/* {q.type?.trim() ? (
                        <span className="mt-1 line-clamp-2 w-full text-left text-[9px] leading-tight text-zinc-600 sm:text-[10px]">
                          {q.type}
                        </span>
                      ) : null} */}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Đang chỉnh sửa
                </p>
                <p className="text-xl font-bold text-black">
                  Câu {selectedQuestionId || "—"}
                  {selectedIndex > 0 && questions.length > 0 ? (
                    <span className="ml-2 text-base font-normal text-zinc-500">
                      ({selectedIndex}/{questions.length})
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {isListen ? (
                <Panel title="Audio đề nghe" icon={Headphones}>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                        Link audio (mp3)
                      </span>
                      <input
                        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/15"
                        placeholder="https://firebasestorage.googleapis.com/..."
                        value={audioDraft}
                        onChange={(e) => setAudioDraft(e.target.value)}
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={saveAudioUrl}
                        disabled={savingAudio}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingAudio ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Save className="h-4 w-4" aria-hidden />
                        )}
                        {savingAudio ? "Đang lưu audio…" : "Lưu link audio"}
                      </button>
                      {setMeta.audioUrl ? (
                        <a
                          href={setMeta.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-black hover:decoration-zinc-600"
                        >
                          Mở audio hiện tại
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                    {audioMessage ? (
                      <p
                        className={`text-sm ${
                          audioMessage.includes("Đã")
                            ? "text-zinc-600"
                            : "font-medium text-black"
                        }`}
                      >
                        {audioMessage}
                      </p>
                    ) : null}
                  </div>
                </Panel>
              ) : null}

              {editForm.type.trim() ? (
                <Panel title="Nhóm / mô tả loại câu" icon={Type}>
                  <textarea
                    className="min-h-[4.5rem] w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/15"
                    rows={2}
                    placeholder="Ví dụ: Câu 1–2 / đoạn văn ngắn…"
                    value={editForm.type}
                    onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                  />
                </Panel>
              ) : null}

              <Panel title="Nội dung & hình ảnh" icon={ImageIcon}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-900 hover:bg-white">
                        {uploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-700" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-500" />
                        )}
                        {uploadingImage ? "Đang tải lên…" : "Chọn ảnh từ máy"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadImage}
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadMessage ? (
                        <span
                          className={`text-sm ${uploadMessage.includes("Không") || uploadMessage.includes("thất") ? "font-medium text-black" : "text-zinc-600"}`}
                        >
                          {uploadMessage}
                        </span>
                      ) : null}
                    </div>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                        URL hoặc HTML nội dung
                      </span>
                      <textarea
                        className="max-h-48 w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-black focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/15"
                        rows={4}
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, content: e.target.value }))
                        }
                      />
                    </label>
                  </div>
                  {isImageUrl(editForm.content) ? (
                    <div className="w-full shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-2 lg:w-[280px]">
                      <Image
                        src={editForm.content}
                        alt="Xem trước nội dung"
                        width={560}
                        height={360}
                        unoptimized
                        className="mx-auto max-h-56 w-auto rounded-lg object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-500 lg:w-[200px]">
                      Chưa có ảnh xem trước
                    </div>
                  )}
                </div>
              </Panel>

              <Panel title="Đáp án & hướng dẫn" icon={CheckCircle2}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-1">
                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-800">
                      <CheckCircle2 className="h-4 w-4 text-zinc-500" aria-hidden />
                      Đáp án đúng
                    </span>
                    <input
                      className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium text-black focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/15"
                      placeholder="1 – 4 hoặc đáp án text"
                      value={editForm.correctAnswer}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, correctAnswer: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-800">
                      <HelpCircle className="h-4 w-4 text-zinc-500" aria-hidden />
                      Hướng dẫn giải
                    </span>
                    <textarea
                      className="min-h-[5rem] w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/15"
                      rows={3}
                      placeholder="Ghi chú cho giáo viên / học viên…"
                      value={editForm.solution}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, solution: e.target.value }))
                      }
                    />
                  </label>
                </div>
              </Panel>
            </div>

            <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-zinc-300 bg-white/95 p-4 shadow-lg shadow-black/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm">
                {saveMessage ? (
                  <p
                    className={
                      saveOk ? "font-medium text-zinc-600" : "font-medium text-black"
                    }
                  >
                    {saveMessage}
                  </p>
                ) : (
                  <p className="text-zinc-500">
                    Lưu để ghi vào Supabase.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={saveQuestion}
                disabled={savingQuestion || !selectedQuestionId}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingQuestion ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-5 w-5" aria-hidden />
                )}
                {savingQuestion ? "Đang lưu…" : "Lưu câu hỏi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
