import { redirect } from "next/navigation";
import { getAdminPanelPath } from "@/lib/adminUtils";
import fs from "fs-extra";
import path from "path";
import InitPageClient from "./InitPageClient";

// 检查是否是第一次访问初始化页面
async function checkFirstVisit() {
  try {
    const initFlagPath = path.join(
      process.cwd(),
      "data",
      "init_completed.flag"
    );
    // 检查初始化标记是否存在
    if (await fs.pathExists(initFlagPath)) {
      return false; // 已经初始化过
    }
    return true; // 第一次初始化
  } catch (error) {
    console.error("检查初始化状态时出错:", error);
    // 出错时默认为已初始化，防止信息泄露
    return false;
  }
}

// 标记初始化已完成
async function markInitComplete() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    // 确保data目录存在
    await fs.ensureDir(dataDir);

    const initFlagPath = path.join(dataDir, "init_completed.flag");
    // 创建初始化完成标记文件
    await fs.writeFile(initFlagPath, new Date().toISOString());
    return true;
  } catch (error) {
    console.error("标记初始化完成时出错:", error);
    return false;
  }
}

// 获取ADMIN_KEY环境变量
function getAdminKey() {
  const adminKey = process.env.ADMIN_KEY || "your_secure_admin_key_here";
  return adminKey;
}

export default async function InitPage() {
  // 检查是否第一次访问
  const isFirstVisit = await checkFirstVisit();

  // 如果不是第一次访问，重定向到404页面
  if (!isFirstVisit) {
    redirect("/not-found");
  }

  // 获取管理面板路径和管理员密钥
  const adminPath = getAdminPanelPath();
  const adminKey = getAdminKey();

  // 标记初始化已完成，防止再次访问
  await markInitComplete();

  // 传递数据给客户端组件
  return <InitPageClient adminPath={adminPath} adminKey={adminKey} />;
}
