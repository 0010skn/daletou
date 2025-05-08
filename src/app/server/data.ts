"use server";

import fs from "fs-extra";
import path from "path";
// import { getCurrentDrawNumber } from "@/lib/utils"; // 移除本地期号计算

// 保存大乐透数据到文件
export async function saveLotteryData(
  data: string,
  ip: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 从第三方 API 获取最新的开奖数据以确定期号
    let currentDrawNumber;
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
      const lastPoolDrawData = lotteryData?.value?.lastPoolDraw;

      if (!lastPoolDrawData || !lastPoolDrawData.lotteryDrawNum) {
        throw new Error(
          "未能从API响应中获取完整的 lastPoolDraw 数据或 lotteryDrawNum"
        );
      }
      currentDrawNumber = lastPoolDrawData.lotteryDrawNum;
    } catch (apiError) {
      console.error("保存数据前从第三方API获取开奖数据失败:", apiError);
      return {
        success: false,
        message: "获取最新期号失败，无法保存数据，请稍后再试。",
      };
    }

    // 创建数据目录（如果不存在）
    const dataDir = path.join(process.cwd(), "data");
    await fs.ensureDir(dataDir);

    // 检查IP提交次数
    const ipRecordsPath = path.join(dataDir, "ip_records.json");
    let ipRecords: Record<string, { count: number; lastSubmit: number }> = {};

    if (await fs.pathExists(ipRecordsPath)) {
      try {
        ipRecords = await fs.readJson(ipRecordsPath);
      } catch (error) {
        console.error("IP记录文件损坏，创建新文件:", error);
        // 如果JSON无效，则创建一个新的空记录
        await fs.writeJson(ipRecordsPath, {});
      }
    }

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // 清理一小时前的记录
    Object.keys(ipRecords).forEach((key) => {
      if (ipRecords[key].lastSubmit < oneHourAgo) {
        delete ipRecords[key];
      }
    });

    // 检查当前IP的提交次数
    const currentIpRecord = ipRecords[ip] || { count: 0, lastSubmit: 0 };

    if (currentIpRecord.count >= 5 && currentIpRecord.lastSubmit > oneHourAgo) {
      return {
        success: false,
        message: "提交次数过多，请等待1小时后重试",
      };
    }

    // 将数据按换行符分割
    const tickets = data
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");

    // 使用从API获取的期号构建文件名
    const outputFile = path.join(dataDir, `${currentDrawNumber}.txt`);

    // 将数据追加到文件
    await fs.appendFile(outputFile, tickets.join("\n") + "\n");

    // 更新IP记录
    ipRecords[ip] = {
      count: currentIpRecord.count + tickets.length,
      lastSubmit: now,
    };

    // 保存IP记录 - 使用try/catch防止写入过程中的错误
    try {
      await fs.writeJson(ipRecordsPath, ipRecords);
    } catch (error) {
      console.error("保存IP记录失败:", error);
      // 即使保存IP记录失败，依然返回成功状态，让用户体验不受影响
    }

    return {
      success: true,
      message: `成功提交${tickets.length}注大乐透号码`,
    };
  } catch (error) {
    console.error("保存大乐透数据出错:", error);
    return {
      success: false,
      message: "系统错误，请稍后再试",
    };
  }
}

// 获取AI分析结果
export async function getAiAnalysisResult(): Promise<string[]> {
  try {
    // 从第三方 API 获取最新的开奖数据以确定期号
    let currentDrawNumber;
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
      const lastPoolDrawData = lotteryData?.value?.lastPoolDraw;

      if (!lastPoolDrawData || !lastPoolDrawData.lotteryDrawNum) {
        throw new Error(
          "未能从API响应中获取完整的 lastPoolDraw 数据或 lotteryDrawNum"
        );
      }
      currentDrawNumber = lastPoolDrawData.lotteryDrawNum;
    } catch (apiError) {
      console.error("获取AI结果前从第三方API获取开奖数据失败:", apiError);
      // 如果无法获取期号，可以尝试返回示例结果或空数组
      const exampleFile = path.join(
        process.cwd(),
        "data",
        "example_result.txt"
      );
      if (await fs.pathExists(exampleFile)) {
        const content = await fs.readFile(exampleFile, "utf-8");
        return content
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "");
      }
      return [];
    }

    const resultFile = path.join(
      process.cwd(),
      "data",
      `${currentDrawNumber}_result.txt`
    );

    if (await fs.pathExists(resultFile)) {
      const content = await fs.readFile(resultFile, "utf-8");
      return content
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "");
    }

    // 如果当前日期的结果文件不存在，尝试使用示例结果
    const exampleFile = path.join(process.cwd(), "data", "example_result.txt");
    if (await fs.pathExists(exampleFile)) {
      const content = await fs.readFile(exampleFile, "utf-8");
      return content
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "");
    }

    return [];
  } catch (error) {
    console.error("获取AI分析结果出错:", error);
    return [];
  }
}

// 定义历史预测数据结构
export interface HistoricalPrediction {
  predictionDate: string; // 预测日期 (YYYYMMDD)
  predictedNumbers: string[]; // 预测号码数组
  predictionType: "user" | "ai"; // 预测类型
  // actualNumbers?: string[]; // 实际开奖号码 (当前系统未存储)
}

// 获取历史预测数据
export async function getHistoricalPredictions(): Promise<
  HistoricalPrediction[]
> {
  const historicalData: HistoricalPrediction[] = [];
  const dataDir = path.join(process.cwd(), "data");

  try {
    // 确保数据目录存在
    if (!(await fs.pathExists(dataDir))) {
      console.log("数据目录不存在，返回空历史记录。");
      return [];
    }

    const files = await fs.readdir(dataDir);

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const stat = await fs.stat(filePath);

      // 只处理文件，忽略目录
      if (stat.isFile()) {
        // 过滤掉包含 "example" 或 "ip_records.json" 的文件名
        if (file.includes("example") || file.includes("ip_records.json")) {
          continue; // 跳过此文件
        }
        const fileName = path.basename(file, ".txt"); // 移除 .txt 后缀
        let predictionDate = "";
        let predictionType: "user" | "ai" | null = null;

        // 检查是否为AI结果文件，例如 20250507_result.txt
        const aiResultMatch = fileName.match(/^(\d{8})_result$/);
        if (aiResultMatch) {
          predictionDate = aiResultMatch[1];
          predictionType = "ai";
        }
        // 检查是否为用户提交文件，例如 20250507.txt
        // 需要确保文件名是8位纯数字 (YYYYMMDD)
        else if (/^\d{8}$/.test(fileName)) {
          predictionDate = fileName;
          predictionType = "user";
        }

        // 根据任务要求，我们只处理AI预测结果以填充历史记录
        // 如果需要同时处理用户提交的数据，这里的逻辑需要调整
        if (predictionDate && predictionType === "ai") {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            const predictedNumbers = content
              .trim()
              .split("\n")
              .filter((line) => line.trim() !== "");

            if (predictedNumbers.length > 0) {
              historicalData.push({
                predictionDate,
                predictedNumbers,
                predictionType,
              });
            }
          } catch (readError) {
            console.error(`读取文件 ${file} 出错:`, readError);
            // 可以选择跳过此文件或进行其他错误处理
          }
        }
      }
    }
  } catch (error) {
    console.error("获取历史预测数据出错:", error);
    // 在发生错误时返回空数组或进行更复杂的错误处理
  }

  // 按预测日期降序排序
  historicalData.sort((a, b) =>
    b.predictionDate.localeCompare(a.predictionDate)
  );

  return historicalData;
}
