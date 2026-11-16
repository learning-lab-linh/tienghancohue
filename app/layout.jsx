import "./globals.css";

export const metadata = {
  title: "Tiếng Hàn Thu Huế",
  description: "Cùng nhau đạt chứng chỉ TOPIK cấp cao",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
