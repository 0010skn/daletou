import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 获取客户端真实IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "";

  // 创建一个新的响应
  const response = NextResponse.next();

  // 添加IP地址到请求头
  response.headers.set("x-real-ip", realIp);

  return response;
}

// 在所有路由上应用中间件
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
