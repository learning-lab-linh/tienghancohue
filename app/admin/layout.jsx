import AdminShell from "./components/AdminShell";

export const metadata = {
  title: "Quản trị | Tiếng Hàn Thu Huế",
  description: "Bảng điều khiển quản trị",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
