import { NextResponse } from "next/server";
import { verifyAdminKey } from "@/lib/adminUtils";
import fs from "fs-extra";
import path from "path";

// 确保文本文件以换行符结束
function ensureFileEndsWithNewline(content: string): string {
  if (!content.endsWith("\n")) {
    return content + "\n";
  }
  return content;
}

export async function GET(request: Request) {
  try {
    // 验证管理员密钥
    const adminKey = request.headers.get("X-Admin-Key");
    if (!adminKey || !verifyAdminKey(adminKey)) {
      return NextResponse.json(
        { error: "管理员密钥无效或未提供" },
        { status: 401 }
      );
    }

    // 获取查询参数
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const filePath = url.searchParams.get("path");

    if (!action) {
      return NextResponse.json({ error: "缺少操作参数" }, { status: 400 });
    }

    // 获取data目录下的文件列表
    if (action === "list") {
      const dataDir = path.join(process.cwd(), "data");
      const contents = await listDirectoryContents(dataDir);
      return NextResponse.json({
        success: true,
        contents,
      });
    }

    // 读取指定文件内容
    if (action === "read" && filePath) {
      const fullPath = path.join(process.cwd(), "data", filePath);

      // 验证路径是否在data目录下
      if (!fullPath.startsWith(path.join(process.cwd(), "data"))) {
        return NextResponse.json({ error: "无权访问此路径" }, { status: 403 });
      }

      if (!(await fs.pathExists(fullPath))) {
        return NextResponse.json({ error: "文件不存在" }, { status: 404 });
      }

      // 检查是否是目录
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        const contents = await listDirectoryContents(fullPath);
        return NextResponse.json({
          success: true,
          isDirectory: true,
          contents,
        });
      }

      // 读取文件内容
      const content = await fs.readFile(fullPath, "utf-8");
      return NextResponse.json({
        success: true,
        isDirectory: false,
        content,
      });
    }

    return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
  } catch (error) {
    console.error("管理员数据操作出错:", error);
    return NextResponse.json(
      { error: "数据操作失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 验证管理员密钥
    const adminKey = request.headers.get("X-Admin-Key");
    if (!adminKey || !verifyAdminKey(adminKey)) {
      return NextResponse.json(
        { error: "管理员密钥无效或未提供" },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { action, path: filePath, content } = body;

    if (!action) {
      return NextResponse.json({ error: "缺少action参数" }, { status: 400 });
    }

    if (!filePath && action !== "mkdir") {
      return NextResponse.json({ error: "缺少path参数" }, { status: 400 });
    }

    // 对于目录创建操作，如果没有提供路径，则创建根目录
    const pathValue = filePath || "";
    const fullPath = path.join(process.cwd(), "data", pathValue);

    // 验证路径是否在data目录下
    if (!fullPath.startsWith(path.join(process.cwd(), "data"))) {
      return NextResponse.json({ error: "无权访问此路径" }, { status: 403 });
    }

    console.log("API处理:", action, "路径:", pathValue);

    // 写入/更新文件
    if (action === "write") {
      if (content === undefined) {
        return NextResponse.json({ error: "缺少content参数" }, { status: 400 });
      }

      try {
        // 确保目录存在
        await fs.ensureDir(path.dirname(fullPath));

        // 对于预测结果文件的特殊处理
        let finalContent = content;
        if (fullPath.includes("/predictions/") && fullPath.endsWith(".txt")) {
          finalContent = ensureFileEndsWithNewline(content);
        }

        // 写入文件
        await fs.writeFile(fullPath, finalContent);

        console.log(`文件保存成功: ${fullPath}`);

        return NextResponse.json({
          success: true,
          message: "文件已保存",
        });
      } catch (writeError) {
        console.error(`写入文件失败(${fullPath}):`, writeError);
        return NextResponse.json(
          {
            error: "文件写入失败",
            details: (writeError as Error).message,
          },
          { status: 500 }
        );
      }
    }

    // 删除文件
    if (action === "delete") {
      if (!(await fs.pathExists(fullPath))) {
        return NextResponse.json({ error: "文件不存在" }, { status: 404 });
      }

      await fs.remove(fullPath);

      return NextResponse.json({
        success: true,
        message: "文件已删除",
      });
    }

    // 创建目录
    if (action === "mkdir") {
      await fs.ensureDir(fullPath);

      return NextResponse.json({
        success: true,
        message: "目录已创建",
      });
    }

    // 重置量子密钥
    if (action === "reset-key") {
      const date = pathValue; // 在这种情况下，pathValue实际上是日期字符串
      const keyPath = path.join(process.cwd(), "data", "pin", `${date}.txt`);

      // 生成新的量子密钥
      const newKey = generateRandomKey();

      // 确保目录存在
      await fs.ensureDir(path.dirname(keyPath));

      // 写入新密钥
      await fs.writeFile(keyPath, newKey);

      return NextResponse.json({
        success: true,
        message: `${date}的量子密钥已重置`,
        newKey,
      });
    }

    return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
  } catch (error) {
    console.error("管理员数据操作出错:", error);
    return NextResponse.json(
      { error: "数据操作失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 辅助函数：生成8位随机密钥
function generateRandomKey(): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 辅助函数：列出目录内容
async function listDirectoryContents(dirPath: string) {
  const items = await fs.readdir(dirPath);
  const contents = await Promise.all(
    items.map(async (item) => {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);
      const relativePath = path.relative(
        path.join(process.cwd(), "data"),
        itemPath
      );

      return {
        name: item,
        path: relativePath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      };
    })
  );

  // 先显示目录，再显示文件，每组按名称排序
  return contents.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
}
