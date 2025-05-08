"use server";

import net from "net";
import { revalidatePath } from "next/cache";
import { saveLotteryData } from "./server/data";
import { headers } from "next/headers";
import { invalidateCache } from "@/lib/cache";
import { LotteryFormSchema } from "@/lib/utils"; // 导入 LotteryFormSchema

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

    // 使用 LotteryFormSchema 验证 tickets
    const validationResult = LotteryFormSchema.safeParse({ tickets });

    if (!validationResult.success) {
      return {
        success: false,
        message:
          "提交的彩票号码不符合规则，请检查每注号码的格式、数字范围及数量。",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 获取真实IP
    const ip = await getClientIP();

    // 保存数据
    // 注意：这里我们传递原始的 tickets 字符串，而不是验证结果中的数据
    // 因为 saveLotteryData 函数期望接收原始的字符串格式
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

// IMPORTANT: In a production environment behind a trusted reverse proxy (e.g., Nginx, Cloudflare),
// it's crucial to configure the application to trust and prioritize specific headers
// set by that proxy (e.g., 'CF-Connecting-IP' for Cloudflare, or the first IP in a
// correctly configured 'X-Forwarded-For' chain).
// The current list and order of headers is a general approach and might need
// adjustment based on the actual deployment architecture to prevent IP spoofing.
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
      if (ips.length > 0) {
        // 确保ips数组不为空
        const clientIP = ips[0]; // 获取数组的第一个元素
        if (clientIP && isValidIP(clientIP)) {
          console.log(`获取到IPv4/IPv6地址(x-forwarded-for): ${clientIP}`);
          return clientIP;
        }
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
  if (!ip) return false;
  const ipVersion = net.isIP(ip);
  return ipVersion === 4 || ipVersion === 6;
}
