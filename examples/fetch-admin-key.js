/**
 * 管理员获取当前密钥示例
 *
 * 这个示例脚本展示了如何通过管理员API获取当前的量子预测密钥
 * 使用方法：node fetch-admin-key.js
 */

// 在实际应用中，应从环境变量或配置文件中获取这些值
const API_URL = "http://localhost:3000/api/admin-key";
const ADMIN_KEY = "dev_admin_key_for_testing"; // 实际使用中应该替换为真实的管理员密钥

async function fetchCurrentKey() {
  try {
    console.log("正在获取当前量子预测密钥...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-Admin-Key": ADMIN_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }

    if (data.success) {
      console.log("成功获取密钥:");
      console.log(`- 当前密钥: ${data.currentKey}`);
      console.log(`- 生成时间: ${new Date(data.generatedAt).toLocaleString()}`);
    } else {
      console.log("请求成功但未返回密钥数据");
    }
  } catch (error) {
    console.error("获取密钥失败:", error.message);
  }
}

// 执行获取密钥操作
fetchCurrentKey();
