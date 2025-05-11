import { NextResponse } from "next/server";
import { getCurrentValidKey, verifyAdminKey } from "@/app/server/data";

// 管理员POST接口 - 获取当前密钥
export async function POST(request: Request) {
  try {
    // 从请求头中获取管理员密钥
    const adminKey = request.headers.get("X-Admin-Key");

    // 验证管理员密钥
    if (!adminKey || !(await verifyAdminKey(adminKey))) {
      return NextResponse.json(
        { error: "管理员密钥无效或未提供" },
        { status: 401 }
      );
    }

    // 获取当前有效的量子预测密钥
    const currentKey = await getCurrentValidKey();

    // 返回成功信息
    return NextResponse.json({
      success: true,
      message: "成功获取当前量子预测密钥",
      currentKey: currentKey,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("获取管理员密钥信息出错:", error);
    return NextResponse.json(
      { error: "获取密钥信息失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}
