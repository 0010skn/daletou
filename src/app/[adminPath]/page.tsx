import { redirect } from "next/navigation";
import { getAdminPanelPath } from "@/lib/adminUtils";
import AdminPanel from "@/components/AdminPanel";
import { headers } from "next/headers";
import net from "net";

// 定义页面属性类型
interface PageProps {
  params: {
    adminPath: string;
  };
}

// 生成带有元数据的页面
export async function generateMetadata({ params }: PageProps) {
  return {
    title: "管理控制面板",
    description: "大乐透分析预测系统管理控制面板",
    robots: {
      index: false,
      follow: false,
    },
  };
}

// 验证IP地址函数
function isValidIP(ip: string): boolean {
  if (!ip) return false;
  const ipVersion = net.isIP(ip);
  return ipVersion === 4 || ipVersion === 6;
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
      if (ips.length > 0 && ips[0] && isValidIP(ips[0])) {
        return ips[0];
      }
    }

    // 尝试其他常见头
    const otherHeaders = [
      "cf-connecting-ip", // Cloudflare
      "true-client-ip", // Akamai和Cloudflare
      "x-client-ip", // 常见自定义头
    ];

    for (const header of otherHeaders) {
      const value = headersList.get(header);
      if (value && isValidIP(value)) {
        return value;
      }
    }

    // 如果所有方法都失败，返回未知IP
    return "未知IP";
  } catch (error) {
    console.error("获取IP地址时出错:", error);
    return "未知IP";
  }
}

// 验证访问路径是否正确
export default async function AdminPage({ params }: PageProps) {
  const unparsedParams = await params;
  const adminPath = unparsedParams.adminPath || "";

  const randomNumber = Math.floor(Math.random() * 3) + 10;
  if (adminPath.length < randomNumber) {
    redirect("/");
  }
  const correctPath = getAdminPanelPath();
  try {
    const clientIP = await getClientIP();
    // 进行严格的字符串比较
    if (String(adminPath).trim() !== String(correctPath).trim()) {
      console.log("⚠️ 可疑访问警告 ⚠️");
      console.log(`访问者IP: ${clientIP}`);
      console.log(`尝试访问路径: ${adminPath}`);
      console.log(`时间: ${new Date().toISOString()}`);
      redirect("/");
    }

    // 路径匹配，返回管理面板组件
    return <AdminPanel />;
  } catch (error) {
    redirect("/");
  }
}
