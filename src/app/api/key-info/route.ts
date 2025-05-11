import { NextResponse } from "next/server";
import { getCurrentValidKey } from "@/app/server/data";

export async function GET(request: Request) {
  try {
    // 获取当前有效的量子预测密钥
    const currentKey = await getCurrentValidKey();

    // 检查访问IP或其他安全验证（实际环境中应添加更严格的验证）
    const url = new URL(request.url);
    const adminToken = url.searchParams.get("admin_token");

    // 简单的管理员令牌验证（实际应用中应更安全）
    if (
      adminToken !== process.env.ADMIN_TOKEN &&
      adminToken !== "dev_token_for_testing"
    ) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 返回成功信息
    return NextResponse.json({
      success: true,
      message: "当前量子预测密钥信息",
      currentKey: currentKey,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("获取密钥信息出错:", error);
    return NextResponse.json(
      { error: "获取密钥信息失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}
