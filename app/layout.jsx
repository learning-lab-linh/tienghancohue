import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tiếng Hàn Thu Huế",
  description: "Cùng nhau đạt chứng chỉ TOPIK cấp cao",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter}>{children}</body>
    </html>
  );
}
