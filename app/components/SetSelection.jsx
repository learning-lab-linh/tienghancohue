"use client";
import React, { useEffect, useState } from "react";

const SetSelection = ({ onSelectSet, sets = [] }) => {
  const [selectedSet, setSelectedSet] = useState(sets[0]?.setKey || "");
  useEffect(() => {
    if (!selectedSet && sets.length) {
      setSelectedSet(sets[0].setKey);
    }
  }, [sets, selectedSet]);

  const selectedLabel =
    sets.find((item) => item.setKey === selectedSet)?.label || "";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-100 px-6 py-4">
            <p className="text-sm font-medium text-slate-500">Ôn luyện TOPIK</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Chọn Bộ Đề Trước Khi Thi
            </h1>
          </div>

          <div className="px-6 py-6">
            <p className="mb-5 text-sm leading-6 text-slate-600">
              Chọn đúng bộ đề bạn muốn luyện để bắt đầu bài thi. Mỗi bộ đề sẽ
              giúp bạn đánh giá kỹ năng theo dạng đề thật.
            </p>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Bộ đề luyện tập
                </span>
                <select
                  className="h-11 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-slate-700 outline-none transition focus:border-slate-500"
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                >
                  {sets.map((setItem) => (
                    <option key={setItem.setKey} value={setItem.setKey}>
                      {setItem.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="h-11 rounded-lg bg-slate-800 px-8 text-sm font-semibold text-white transition hover:bg-slate-700"
                disabled={!selectedSet}
                onClick={() => onSelectSet(selectedSet)}
              >
                Bắt đầu thi
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Bạn đang chọn:{" "}
              <span className="font-semibold text-slate-800">{selectedLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetSelection;
