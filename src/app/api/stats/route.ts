import fs from "fs-extra";
import path from "path";
import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/cache";
import { getCurrentDrawNumber } from "@/lib/utils";

export async function GET() {
  try {
    // 使用缓存获取统计数据，缓存时间缩短到30秒
    const stats = await getCachedData(
      "lottery-stats",
      getSubmissionStats,
      1000 * 30 // 30秒缓存
    );

    // 设置响应头，禁止浏览器缓存
    const response = NextResponse.json(stats);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("获取统计数据出错:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}

// 获取提交统计数据
async function getSubmissionStats() {
  const dataDir = path.join(process.cwd(), "data");
  const currentDrawNumber = getCurrentDrawNumber();
  const submissionFile = path.join(dataDir, `${currentDrawNumber}.txt`);

  await fs.ensureDir(dataDir);

  let totalTickets = 0;

  // 如果当前期号文件存在，计算提交的总注数
  if (await fs.pathExists(submissionFile)) {
    const content = await fs.readFile(submissionFile, "utf-8");
    totalTickets = content
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "").length;
  }

  return {
    currentDrawNumber,
    totalTickets,
    lastUpdated: new Date().toISOString(),
  };
}
