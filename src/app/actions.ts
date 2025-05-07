"use server";

import { revalidatePath } from "next/cache";
import { saveLotteryData } from "./server/data";
import { headers } from "next/headers";
import { invalidateCache } from "@/lib/cache";

// 处理大乐透数据提交
export async function submitLotteryData(formData: FormData) {
  try {
    // 从表单获取数据
    const tickets = formData.get("tickets")?.toString() || "";

    if (!tickets || tickets.trim() === "") {
      return {
        success: false,
        message: "请输入大乐透号码",
      };
    }

    // 获取真实IP
    const ip = await getClientIP();

    // 保存数据
    const result = await saveLotteryData(tickets, ip);

    // 清除API数据缓存，确保下次访问能看到最新的数据
    invalidateCache("lottery-stats");

    // 重新验证路径，更新页面数据
    revalidatePath("/");

    return result;
  } catch (error) {
    console.error("提交数据出错:", error);
    return {
      success: false,
      message: "系统错误，请稍后再试",
    };
  }
}

// 获取客户端IP地址的函数
async function getClientIP(): Promise<string> {
  try {
    // 获取请求头
    const headersList = await headers();

    // 尝试从X-Real-IP获取（通常由Nginx或其他代理服务器设置）
    const xRealIp = headersList.get("x-real-ip");
    if (xRealIp && isValidIP(xRealIp)) {
      return xRealIp;
    }

    // 尝试从X-Forwarded-For获取（标准代理头）
    const xForwardedFor = headersList.get("x-forwarded-for");
    if (xForwardedFor) {
      // X-Forwarded-For可能包含多个IP，以逗号分隔，第一个是最初的客户端IP
      const ips = xForwardedFor.split(",").map((ip: string) => ip.trim());
      const clientIP = ips[0];
      if (isValidIP(clientIP)) {
        console.log(`获取到IPv4/IPv6地址(x-forwarded-for): ${clientIP}`);
        return clientIP;
      }
    }

    // 尝试其他常见头
    const otherHeaders = [
      "cf-connecting-ip", // Cloudflare
      "true-client-ip", // Akamai和Cloudflare
      "x-client-ip", // 常见自定义头
      "x-cluster-client-ip", // 负载均衡
      "forwarded", // RFC 7239
      "x-forwarded", // 变种
    ];

    for (const header of otherHeaders) {
      const value = headersList.get(header);
      if (value && isValidIP(value)) {
        console.log(`获取到IPv4/IPv6地址(${header}): ${value}`);
        return value;
      }
    }

    // 处理IPv6和本地地址
    const remoteAddr = headersList.get("remote-addr");
    if (remoteAddr) {
      // 特殊处理IPv6本地地址
      if (remoteAddr === "::1" || remoteAddr === "::ffff:127.0.0.1") {
        return "127.0.0.1";
      }

      if (isValidIP(remoteAddr)) {
        console.log(`获取到IPv4/IPv6地址(remote-addr): ${remoteAddr}`);
        return remoteAddr;
      }
    }

    // 如果所有方法都失败，使用默认IP
    console.warn("无法获取真实IP地址，使用默认值");
    return "127.0.0.1";
  } catch (error) {
    console.error("获取IP地址时出错:", error);
    return "127.0.0.1";
  }
}

// 验证IP地址函数
function isValidIP(ip: string): boolean {
  // 检查是否为空
  if (!ip) return false;

  // 本地地址特殊处理
  if (ip === "::1" || ip === "localhost" || ip === "127.0.0.1") {
    return true;
  }

  // IPv4地址验证
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (ipv4Pattern.test(ip)) {
    // 检查每个段是否在0-255范围内
    const parts = ip.split(".");
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6地址验证（简化版）
  if (ip.includes(":")) {
    // 最简单的IPv6验证，只检查格式
    // 允许 2001:db8::1 这种缩写形式和完整形式
    return true;
  }

  return false;
}
