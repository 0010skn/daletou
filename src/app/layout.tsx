import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getAdminPanelPath } from "@/lib/adminUtils";

// 在服务器端打印管理面板路径（仅在开发环境）
if (process.env.NODE_ENV === "development") {
  const adminPath = getAdminPanelPath();
  const adminKey = process.env.ADMIN_KEY || "your_secure_admin_key_here";
  console.log("\n==================================");
  console.log("管理面板路径: /" + adminPath);
  console.log("完整URL: http://localhost:3000/" + adminPath);
  console.log("管理员密钥: " + adminKey);
  console.log("==================================\n");
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "大乐透AI量化分析系统",
  description: "上传您的大乐透号码，获取AI量化分析结果",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
