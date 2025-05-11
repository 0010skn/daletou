/**
 * 清理过期密钥脚本
 *
 * 这个脚本用于清理项目中的过期密钥目录
 * 使用方法: node scripts/cleanup-expired-keys.js
 */

const fs = require("fs-extra");
const path = require("path");

async function cleanupExpiredKeys() {
  try {
    console.log("开始清理过期密钥...");

    // 定义过期密钥目录路径
    const expiredDir = path.join(process.cwd(), "data", "pin", "expired");

    // 检查目录是否存在
    if (await fs.pathExists(expiredDir)) {
      console.log(`找到过期密钥目录: ${expiredDir}`);

      // 删除目录及其内容
      await fs.remove(expiredDir);
      console.log("已成功删除过期密钥目录及其所有内容");
    } else {
      console.log("过期密钥目录不存在，无需清理");
    }

    console.log("清理过程完成");
  } catch (error) {
    console.error("清理过期密钥时出错:", error.message);
  }
}

// 执行清理操作
cleanupExpiredKeys();
