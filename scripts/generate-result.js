/**
 * 生成预测结果文件
 *
 * 这个脚本用于生成当前期号的AI预测结果文件
 * 使用方法: node scripts/generate-result.js [期号]
 */

const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");

async function generateResultFile() {
  try {
    console.log("开始生成预测结果文件...");

    // 获取命令行参数中的期号，如果没有提供则自动获取
    let drawNumber = process.argv[2];

    // 如果没有提供期号，尝试从API获取
    if (!drawNumber) {
      console.log("未提供期号，尝试从API获取当前期号...");
      try {
        const lotteryApiUrl =
          "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=1&isVerify=1&pageNo=1";
        const response = await fetch(lotteryApiUrl);
        if (!response.ok) {
          throw new Error(
            `获取最新开奖数据失败: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        const lastPoolDrawData = data?.value?.lastPoolDraw;

        if (!lastPoolDrawData || !lastPoolDrawData.lotteryDrawNum) {
          throw new Error(
            "未能从API响应中获取完整的 lastPoolDraw 数据或 lotteryDrawNum"
          );
        }

        drawNumber = lastPoolDrawData.lotteryDrawNum;
        console.log(`成功获取当前期号: ${drawNumber}`);
      } catch (error) {
        console.error("获取期号失败:", error.message);
        console.log(
          "请手动提供期号作为参数运行脚本: node scripts/generate-result.js 期号"
        );
        process.exit(1);
      }
    }

    // 示例预测结果数据 (实际应用中可能需要更复杂的生成逻辑)
    const exampleResults = [
      "01 03 15 22 28 + 02 12",
      "06 10 13 28 33 + 03 08",
      "05 11 19 25 30 + 07 09",
      "02 07 16 24 35 + 04 10",
      "09 14 18 27 31 + 01 11",
    ];

    // 确保数据目录存在
    const dataDir = path.join(process.cwd(), "data");
    await fs.ensureDir(dataDir);

    // 生成结果文件路径
    const resultFilePath = path.join(dataDir, `${drawNumber}_result.txt`);

    // 写入预测结果
    await fs.writeFile(resultFilePath, exampleResults.join("\n"));

    console.log(
      `已成功生成期号 ${drawNumber} 的预测结果文件: ${resultFilePath}`
    );
  } catch (error) {
    console.error("生成预测结果文件时出错:", error.message);
  }
}

// 执行生成操作
generateResultFile();
