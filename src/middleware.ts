import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminPanelPath } from "./lib/adminUtils";

export function middleware(request: NextRequest) {
  // 获取客户端真实IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "";

  const { pathname } = request.nextUrl;
  // 获取管理面板路径
  const adminPanelPath = getAdminPanelPath();

  // 创建一个新的响应
  const response = NextResponse.next();

  // 添加IP地址到请求头
  response.headers.set("x-real-ip", realIp);

  // 检查是否访问管理面板路由 - 确保使用字符串比较
  if (pathname.startsWith(`/${String(adminPanelPath)}`)) {
    // 添加no-index头，防止搜索引擎抓取
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Frame-Options", "DENY");
  }

  return response;
}

// 配置匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api 路由
     * - 静态文件路由 (_next/static, favicon.ico 等)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
