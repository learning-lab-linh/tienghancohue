/**
 * Sau khi POST /api/student/session thành công:
 * nếu học viên chưa nhập mã lớp → /nhap-ma-lop?from=...
 * @param {import("next/navigation").AppRouterInstance} router
 * @param {string} nextPath đích sau khi đã có mã lớp (vd. /pages/Select)
 */
export async function redirectAfterStudentSession(router, nextPath) {
  if (nextPath.startsWith("/nhap-ma-lop")) {
    router.push(nextPath);
    router.refresh();
    return;
  }

  const res = await fetch("/api/student/class/status");
  const data = await res.json().catch(() => ({}));
  if (data.loggedIn && !data.enrolled) {
    router.push(`/nhap-ma-lop?from=${encodeURIComponent(nextPath)}`);
  } else {
    router.push(nextPath);
  }
  router.refresh();
}
