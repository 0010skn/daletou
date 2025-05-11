import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 尝试从请求头中获取真实 IP
    // 优先从 Nginx、Cloudflare 等代理转发的头部获取
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    // 获取到的IP可能是逗号分隔的列表，取第一个值
    let clientIp = "unknown";

    if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    } else {
      // 如果都获取不到，尝试从其他常用头部获取
      const cfIp = request.headers.get("CF-Connecting-IP");
      const trueClientIp = request.headers.get("True-Client-IP");

      if (cfIp) {
        clientIp = cfIp;
      } else if (trueClientIp) {
        clientIp = trueClientIp;
      }
    }

    // 混淆IP，保护用户隐私，仅用于标识不同用户
    // 实际生产环境可能需要更严格的处理
    const hashedIp = `client_${clientIp.split(".").join("_")}`;

    return NextResponse.json({
      ip: hashedIp,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("获取客户端IP时出错:", error);
    return NextResponse.json({ error: "获取客户端IP失败" }, { status: 500 });
  }
}
