import Link from "next/link";

function Select() {
  return (
    <div className="min-h-screen bg-slate-100 px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="mb-8 text-center text-2xl font-bold text-slate-800">
            Hãy lựa chọn phần bạn muốn ôn
          </h1>
          <div className="flex flex-col items-center gap-3">
            <Link href={"/pages/Listen"}>
              <button
                type="button"
                className="w-40 rounded-lg bg-slate-800 px-6 py-2.5 text-white transition hover:bg-slate-700"
              >
                Listen
              </button>
            </Link>
            <Link href={"/pages/Reading"}>
              <button
                type="button"
                className="w-40 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-slate-700 transition hover:bg-slate-50"
              >
                Reading
              </button>
            </Link>
            <Link href={"/admin"}>
              <button
                type="button"
                className="w-40 rounded-lg bg-emerald-600 px-6 py-2.5 text-white transition hover:bg-emerald-500"
              >
                Admin
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Select;
