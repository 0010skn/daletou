import fs from "fs-extra";
import path from "path";
import { NextResponse } from "next/server";

// 移除对本地 getCurrentDrawNumber 的导入，后续将从 API 获取
// import { getCurrentDrawNumber } from "@/lib/utils";

export async function GET() {
  try {
    // 直接调用 getSubmissionStats，移除缓存
    const stats = await getSubmissionStats();

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

  // 从第三方 API 获取最新的开奖数据
  let lastPoolDrawData;
  try {
    const lotteryApiUrl =
      "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=1&isVerify=1&pageNo=1";
    const lotteryResponse = await fetch(lotteryApiUrl, {
      cache: "no-store", // 禁用 fetch 缓存，确保实时性
    });
    if (!lotteryResponse.ok) {
      throw new Error(
        `获取最新开奖数据失败: ${lotteryResponse.status} ${lotteryResponse.statusText}`
      );
    }
    const lotteryData = await lotteryResponse.json();
    lastPoolDrawData = lotteryData?.value?.lastPoolDraw;
    // 移除之前添加的调试日志

    if (!lastPoolDrawData || !lastPoolDrawData.lotteryDrawNum) {
      throw new Error(
        "未能从API响应中获取完整的 lastPoolDraw 数据或 lotteryDrawNum"
      );
    }
  } catch (apiError) {
    console.error("从第三方API获取开奖数据失败:", apiError);
    return {
      error: "获取最新开奖数据失败",
      lotteryDrawNum: "ERROR",
      lotteryDrawResult: "",
      lotteryDrawTime: "",
      poolBalanceAfterdraw: "",
      totalSaleAmount: "0", // 添加默认的 totalSaleAmount
      totalTickets: 0, // 保持原有逻辑，如果需要也可以移除
      lastUpdated: new Date().toISOString(),
    };
  }

  const currentDrawNumber = lastPoolDrawData.lotteryDrawNum;
  const submissionFile = path.join(dataDir, `${currentDrawNumber}.txt`);

  await fs.ensureDir(dataDir);

  let totalTickets = 0;

  // 如果当前期号文件存在，计算提交的总注数 (这部分逻辑可以保留，如果业务需要的话)
  if (await fs.pathExists(submissionFile)) {
    const content = await fs.readFile(submissionFile, "utf-8");
    totalTickets = content
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "").length;
  }

  return {
    lotteryDrawNum: lastPoolDrawData.lotteryDrawNum,
    lotteryDrawResult: lastPoolDrawData.lotteryDrawResult,
    lotteryDrawTime: lastPoolDrawData.lotteryDrawTime,
    poolBalanceAfterdraw: lastPoolDrawData.poolBalanceAfterdraw,
    totalSaleAmount: lastPoolDrawData.totalSaleAmount || "0", // 从API获取销售总额，如果不存在则为 "0"
    // 可以根据需要添加其他从 lastPoolDrawData 获取的字段
    totalTickets, // 保留 totalTickets，如果前端也需要展示的话
    lastUpdated: new Date().toISOString(), // 这个时间戳现在代表API数据获取时间
  };
}
