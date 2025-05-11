import { NextResponse } from "next/server";
import { verifyAdminKey } from "@/lib/adminUtils";
import { LRUCache } from "lru-cache";

// 使用LRU缓存记录IP尝试次数，防止暴力破解
const ipAttemptsCache = new LRUCache<
  string,
  { attempts: number; blockedUntil?: number }
>({
  max: 100, // 最多缓存100个IP
  ttl: 1000 * 60 * 60, // 1小时过期
});

export async function POST(request: Request) {
  try {
    // 获取客户端IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp =
      realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown");

    // 检查IP是否被封禁
    const ipRecord = ipAttemptsCache.get(clientIp) || { attempts: 0 };

    // 如果IP被封禁且封禁时间未到，拒绝请求
    if (ipRecord.blockedUntil && ipRecord.blockedUntil > Date.now()) {
      const minutesLeft = Math.ceil(
        (ipRecord.blockedUntil - Date.now()) / (60 * 1000)
      );
      return NextResponse.json(
        {
          success: false,
          message: `由于多次尝试错误密钥，您的访问暂时被限制。请在${minutesLeft}分钟后再试。`,
        },
        { status: 429 }
      );
    }

    // 如果IP曾经被封禁但封禁时间已过，重置尝试次数
    if (ipRecord.blockedUntil && ipRecord.blockedUntil <= Date.now()) {
      ipRecord.attempts = 0;
      ipRecord.blockedUntil = undefined;
    }

    // 解析请求体
    const { adminKey } = await request.json();

    // 验证管理员密钥
    if (!adminKey || !verifyAdminKey(adminKey)) {
      // 记录失败尝试
      ipRecord.attempts += 1;

      // 如果尝试次数达到5次，封禁1小时
      if (ipRecord.attempts >= 5) {
        ipRecord.blockedUntil = Date.now() + 60 * 60 * 1000; // 1小时
        ipAttemptsCache.set(clientIp, ipRecord);

        return NextResponse.json(
          {
            success: false,
            message: "验证失败次数过多，您的访问已暂时被限制1小时。",
          },
          { status: 429 }
        );
      }

      // 更新IP记录
      ipAttemptsCache.set(clientIp, ipRecord);

      return NextResponse.json(
        {
          success: false,
          message: `管理员密钥无效，剩余尝试次数: ${5 - ipRecord.attempts}`,
        },
        { status: 401 }
      );
    }

    // 验证成功，重置尝试次数
    ipAttemptsCache.set(clientIp, { attempts: 0 });

    // 返回成功信息
    return NextResponse.json({
      success: true,
      message: "管理员身份验证成功",
    });
  } catch (error) {
    console.error("管理员验证过程中出错:", error);
    return NextResponse.json(
      { success: false, message: "验证过程中发生错误" },
      { status: 500 }
    );
  }
}
