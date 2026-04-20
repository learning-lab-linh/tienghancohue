/** @param {string | undefined} code */
export function mapFirebaseAuthError(code) {
  const map = {
    "auth/email-already-in-use": "Email này đã được đăng ký.",
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/weak-password": "Mật khẩu quá yếu (Firebase yêu cầu tối thiểu 6 ký tự).",
    "auth/user-not-found": "Không tìm thấy tài khoản với email này.",
    "auth/wrong-password": "Sai mật khẩu.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "auth/too-many-requests": "Thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.",
    "auth/network-request-failed": "Lỗi mạng. Kiểm tra kết nối internet.",
    "auth/popup-closed-by-user": "Cửa sổ đăng nhập đã đóng. Thử lại nếu bạn muốn đăng nhập.",
    "auth/cancelled-popup-request": "Đã hủy đăng nhập Google.",
    "auth/popup-blocked": "Trình duyệt đã chặn cửa sổ popup. Hãy cho phép popup cho trang này.",
    "auth/account-exists-with-different-credential":
      "Email này đã đăng ký bằng cách khác. Hãy đăng nhập bằng email và mật khẩu.",
  };
  if (code && map[code]) return map[code];
  return "Đăng nhập / đăng ký thất bại. Vui lòng thử lại.";
}
