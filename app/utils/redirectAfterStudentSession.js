/**
 * Sau khi POST /api/student/session thành công:
 * nếu học viên chưa nhập mã lớp → /nhap-ma-lop?from=...
 * @param {import("next/navigation").AppRouterInstance} router
 * @param {string} nextPath đích sau khi đã có mã lớp (vd. /pages/Select)
 * @param {{ loggedIn?: boolean, enrolled?: boolean } | null} [sessionState]
 */
export async function redirectAfterStudentSession(router, nextPath, sessionState = null) {
  if (nextPath.startsWith("/nhap-ma-lop")) {
    router.push(nextPath);
    router.refresh();
    return;
  }

  const hasSessionState =
    sessionState &&
    typeof sessionState === "object" &&
    typeof sessionState.enrolled === "boolean";
  const data = hasSessionState
    ? {
        loggedIn:
          typeof sessionState.loggedIn === "boolean" ? sessionState.loggedIn : true,
        enrolled: sessionState.enrolled,
      }
    : await fetch("/api/student/class/status")
        .then((res) => res.json().catch(() => ({})))
        .catch(() => ({}));
  if (data.loggedIn && !data.enrolled) {
    router.push(`/nhap-ma-lop?from=${encodeURIComponent(nextPath)}`);
  } else {
    router.push(nextPath);
  }
  router.refresh();
}
