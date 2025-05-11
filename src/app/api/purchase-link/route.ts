import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

export async function GET() {
  try {
    const linkPath = path.join(process.cwd(), "data", "purchase_link.txt");
    const pricePath = path.join(process.cwd(), "data", "key_price.txt");
    let link = "https://example.com/purchase"; // 默认链接
    let price = "29.9"; // 默认价格

    // 检查链接文件是否存在
    if (await fs.pathExists(linkPath)) {
      const linkContent = await fs.readFile(linkPath, "utf-8");
      link = linkContent.trim() || link;
    }

    // 检查价格文件是否存在
    if (await fs.pathExists(pricePath)) {
      const priceContent = await fs.readFile(pricePath, "utf-8");
      price = priceContent.trim() || price;
    }

    return NextResponse.json({
      success: true,
      link: link,
      price: price,
    });
  } catch (error) {
    console.error("获取购买链接和价格出错:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取购买信息失败",
        link: "https://example.com/purchase", // 出错时也返回默认链接
        price: "29.9", // 出错时也返回默认价格
      },
      { status: 500 }
    );
  }
}
