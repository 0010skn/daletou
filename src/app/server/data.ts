"use server";

import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
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
      // 如果无法获取期号，返回提示信息
      return ["无法获取当前期号，请检查网络连接后重试"];
    }

    // 结果文件路径改为 期号_result.txt
    const resultFile = path.join(
      process.cwd(),
      "data",
      `${currentDrawNumber}_result.txt`
    );

    if (await fs.pathExists(resultFile)) {
      // 如果存在当期结果文件，读取并返回
      const content = await fs.readFile(resultFile, "utf-8");
      const results = content
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "");

      // 如果结果少于3个，显示"正在预测"
      if (results.length < 3) {
        return [
          "⌛ 正在进行量子计算预测中，请稍候...",
          "🔮 AI模型正在分析历史数据",
          "📊 预计很快会生成本期预测结果",
        ];
      }

      return results;
    }

    // 如果当前期号的结果文件不存在，返回特定提示信息
    return [
      "⏳ 本期预测结果还没出来",
      "🧪 量子计算正在进行中",
      "📱 请稍后再查看",
    ];
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
    // 获取当前期号，用于排除当前期号的预测
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
      console.error("获取历史记录时获取当前期号失败:", apiError);
      // 如果无法获取当前期号，假设一个不存在的期号
      currentDrawNumber = "unknown_draw_number";
    }

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

        // 检查是否为AI结果文件，格式为 期号_result.txt
        // 由于期号格式可能是各种数字格式，我们统一匹配所有带 _result 后缀的文件
        const aiResultMatch = fileName.match(/^(.+)_result$/);
        if (aiResultMatch) {
          predictionDate = aiResultMatch[1];
          predictionType = "ai";
        }
        // 检查是否为用户提交文件
        // 如果文件名不包含"result"和"ip_records"，视为用户提交文件
        else if (
          !fileName.includes("result") &&
          !fileName.includes("ip_records")
        ) {
          predictionDate = fileName;
          predictionType = "user";
        }

        // 跳过当前期号的记录，提高安全性
        if (predictionDate === currentDrawNumber) {
          continue;
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

// 自动生成并验证量子预测密钥
export async function verifyAccessCode(
  code: string,
  ip: string = "unknown"
): Promise<{ success: boolean; message: string }> {
  try {
    // 如果是系统自动触发的验证，跳过IP检查
    if (code === "trigger-update-check") {
      // 系统触发验证只检查和更新，不需要进行验证结果判断
      const pinDir = path.join(process.cwd(), "data", "pin");
      await fs.ensureDir(pinDir);
      const today = new Date().toISOString().slice(0, 10);
      const dailyPinFilePath = path.join(pinDir, `${today}.txt`);
      const needUpdate = await shouldUpdateDailyKey(dailyPinFilePath);
      if (needUpdate) {
        const newCode = generateQuantumKey();
        await fs.writeFile(dailyPinFilePath, newCode);
        console.log(`系统自动更新${today}的量子预测密钥`);
      }
      return { success: false, message: "系统自动检查" };
    }

    // 针对真实用户验证，先检查IP是否被限制
    if (ip !== "unknown") {
      // 检查IP是否被限制
      const ipCheck = await checkAndRecordKeyAttempt(ip, false);
      if (!ipCheck.allowed) {
        return {
          success: false,
          message: ipCheck.message || "访问受限，请稍后再试",
        };
      }
    }

    // 检查pin目录是否存在，如不存在则创建
    const pinDir = path.join(process.cwd(), "data", "pin");
    await fs.ensureDir(pinDir);

    // 获取当前日期
    const today = new Date().toISOString().slice(0, 10); // 格式: YYYY-MM-DD

    // 当天密钥文件路径
    const dailyPinFilePath = path.join(pinDir, `${today}.txt`);

    // 判断文件是否存在以及是否需要更新（基于自然天）
    const needUpdate = await shouldUpdateDailyKey(dailyPinFilePath);

    // 读取或生成当天密钥
    let dailyCode: string;

    if (needUpdate) {
      // 生成今日新密钥（使用MD5处理当天日期和随机数）
      dailyCode = generateQuantumKey();
      await fs.writeFile(dailyPinFilePath, dailyCode);
      console.log(`已更新${today}的量子预测密钥`);
    } else {
      // 读取已存在的当天密钥
      dailyCode = (await fs.readFile(dailyPinFilePath, "utf-8")).trim();
    }

    // 验证用户输入的密钥
    const validKey = code.trim() === dailyCode;

    // 更新IP尝试记录
    if (ip !== "unknown") {
      const ipUpdate = await checkAndRecordKeyAttempt(ip, validKey);
      if (!ipUpdate.allowed) {
        return {
          success: false,
          message: ipUpdate.message || "访问受限，请稍后再试",
        };
      }
    }

    if (validKey) {
      return {
        success: true,
        message: "验证成功",
      };
    } else {
      return {
        success: false,
        message:
          ip !== "unknown"
            ? (await checkAndRecordKeyAttempt(ip, false)).message ||
              "量子预测密钥无效"
            : "量子预测密钥无效，请检查输入是否正确",
      };
    }
  } catch (error) {
    console.error("验证量子预测密钥时出错:", error);
    return {
      success: false,
      message: "系统错误，请稍后再试",
    };
  }
}

// 生成量子预测密钥
function generateQuantumKey(): string {
  // 使用当前日期、时间戳和随机数生成MD5哈希
  const timestamp = Date.now();
  const randomNum = Math.random().toString();
  const date = new Date().toISOString();

  // 组合输入并创建MD5哈希
  const data = `${date}-${timestamp}-${randomNum}`;
  const md5Hash = crypto.createHash("md5").update(data).digest("hex");

  // 取前8位作为密钥
  return md5Hash.substring(0, 8);
}

// 判断是否需要更新密钥
async function shouldUpdateDailyKey(filePath: string): Promise<boolean> {
  // 如果文件不存在，需要创建
  if (!(await fs.pathExists(filePath))) {
    return true;
  }

  try {
    // 获取文件状态
    const stats = await fs.stat(filePath);
    const fileModTime = stats.mtime; // 最后修改时间

    // 获取当前日期的0点时间
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 如果文件最后修改时间早于今天0点，则需要更新
    return fileModTime < today;
  } catch (error) {
    console.error("检查文件修改时间失败:", error);
    // 发生错误时，安全起见返回true以重新生成密钥
    return true;
  }
}

// 获取当前有效的量子预测密钥（用于API调试）
export async function getCurrentValidKey(): Promise<string> {
  try {
    // 确保验证过程已经运行，触发可能的密钥更新
    await verifyAccessCode("trigger-update-check");

    // 获取当前日期
    const today = new Date().toISOString().slice(0, 10);
    const dailyPinFilePath = path.join(
      process.cwd(),
      "data",
      "pin",
      `${today}.txt`
    );

    // 读取当天的密钥
    if (await fs.pathExists(dailyPinFilePath)) {
      return (await fs.readFile(dailyPinFilePath, "utf-8")).trim();
    }

    // 如果当天密钥无法获取，生成一个新的并保存
    const newKey = generateQuantumKey();
    await fs.writeFile(dailyPinFilePath, newKey);
    console.log(`已为${today}创建新的量子预测密钥`);
    return newKey;
  } catch (error) {
    console.error("获取当前有效密钥失败:", error);
    return "密钥获取出错";
  }
}

// 验证管理员密钥
export async function verifyAdminKey(key: string): Promise<boolean> {
  // 从环境变量获取管理员密钥，如果未设置则使用开发测试密钥
  const adminKey = process.env.ADMIN_KEY || "dev_admin_key_for_testing";
  return key === adminKey;
}

// 密钥尝试记录，用于防止暴力破解
interface KeyAttemptRecord {
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
  blockUntil?: number;
}

// IP尝试记录映射
const keyAttemptRecords: Map<string, KeyAttemptRecord> = new Map();

// 检查并记录密钥尝试次数，防止暴力破解
export async function checkAndRecordKeyAttempt(
  ip: string,
  success: boolean
): Promise<{ allowed: boolean; message?: string }> {
  // 清理超过24小时的记录
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // 获取IP的尝试记录，如果不存在则创建
  let record = keyAttemptRecords.get(ip);
  if (!record) {
    record = { attempts: 0, lastAttempt: now, blocked: false };
    keyAttemptRecords.set(ip, record);
  }

  // 如果被阻止且阻止时间未到，拒绝请求
  if (record.blocked && record.blockUntil && record.blockUntil > now) {
    const minutesLeft = Math.ceil((record.blockUntil - now) / (60 * 1000));
    return {
      allowed: false,
      message: `由于多次尝试错误密钥，您的访问暂时被限制。请在${minutesLeft}分钟后再试。`,
    };
  }

  // 如果阻止时间已过，重置状态
  if (record.blocked && record.blockUntil && record.blockUntil <= now) {
    record.blocked = false;
    record.attempts = 0;
  }

  // 如果上次尝试时间超过24小时，重置计数
  if (record.lastAttempt < oneDayAgo) {
    record.attempts = 0;
  }

  // 更新记录
  record.lastAttempt = now;

  // 验证成功则重置计数
  if (success) {
    record.attempts = 0;
    return { allowed: true };
  }

  // 验证失败则增加计数
  record.attempts += 1;

  // 达到一定次数后阻止
  if (record.attempts >= 5) {
    record.blocked = true;
    // 阻止1小时
    record.blockUntil = now + 60 * 60 * 1000;
    const minutesLeft = 60;
    return {
      allowed: false,
      message: `由于多次尝试错误密钥，您的访问暂时被限制。请在${minutesLeft}分钟后再试。`,
    };
  }

  // 返回剩余尝试次数提示
  return {
    allowed: true,
    message: `密钥验证失败，今日剩余尝试次数: ${5 - record.attempts}`,
  };
}

// 验证管理员密钥
