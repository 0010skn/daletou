import { NextResponse } from "next/server";
import { verifyAccessCode, getCurrentValidKey } from "@/app/server/data";
import crypto from "crypto";

export async function GET() {
  try {
    // 触发密钥检查和更新
    await verifyAccessCode("auto-check");

    // 获取当前有效密钥
    const currentKey = await getCurrentValidKey();

    // 生成密钥的MD5值
    const encryptedKey = crypto
      .createHash("md5")
      .update(currentKey)
      .digest("hex");

    // 返回成功信息，包含加密后的密钥
    return NextResponse.json({
      success: true,
      message: "密钥检查完成",
      encryptedKey: encryptedKey, // 返回加密后的密钥
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("自动密钥检查出错:", error);
    return NextResponse.json({ error: "密钥检查失败" }, { status: 500 });
  }
}
