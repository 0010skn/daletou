import { redirect } from "next/navigation";
import { getAdminPanelPath } from "@/lib/adminUtils";
import AdminPanel from "@/components/AdminPanel";

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

// 验证访问路径是否正确
export default function AdminPage({ params }: PageProps) {
  try {
    // 确保params已经解析完成
    const adminPath = params?.adminPath || "";
    const correctPath = getAdminPanelPath();

    console.log("尝试访问管理面板，路径:", adminPath);
    console.log("正确路径:", correctPath);

    // 进行严格的字符串比较
    if (String(adminPath).trim() !== String(correctPath).trim()) {
      console.log("路径不匹配，重定向到首页");
      redirect("/");
      return null;
    }

    console.log("路径匹配，显示管理面板");
    // 路径匹配，返回管理面板组件
    return <AdminPanel />;
  } catch (error) {
    console.error("访问管理面板时出错:", error);
    // 任何错误都重定向到首页
    redirect("/");
    return null;
  }
}
