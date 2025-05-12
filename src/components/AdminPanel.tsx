"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLogin from "./AdminLogin";
import PredictionManager from "./PredictionManager";
import AdminWelcomeModal from "./AdminWelcomeModal";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
}

export default function AdminPanel() {
  // 状态管理
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [contents, setContents] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [activeTab, setActiveTab] = useState("files");
  const [newKeyDate, setNewKeyDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [purchaseLink, setPurchaseLink] = useState(
    "https://example.com/purchase"
  );
  const [keyPrice, setKeyPrice] = useState<string>("29.9");
  const [currentValidKey, setCurrentValidKey] = useState<string>("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();

  // 检查是否应该显示欢迎弹窗
  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenWelcomeModal = localStorage.getItem("admin_welcome_seen");
      if (!hasSeenWelcomeModal) {
        setShowWelcomeModal(true);
      }
    }
  }, [isAuthenticated]);

  // 处理关闭欢迎弹窗
  const handleCloseWelcomeModal = () => {
    localStorage.setItem("admin_welcome_seen", "true");
    setShowWelcomeModal(false);
  };

  // 认证成功的回调
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchContents();
  };

  // 获取目录内容
  const fetchContents = async (path = "") => {
    setIsLoading(true);
    setError("");
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`/api/admin-data?action=list&path=${path}`, {
        headers: {
          "X-Admin-Key": storedAdminKey,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("adminKey");
          setError("会话已过期，请重新登录");
          return;
        }
        throw new Error("获取数据失败");
      }

      const data = await response.json();
      if (data.success) {
        setContents(data.contents);
        setCurrentPath(path);
      } else {
        setError(data.error || "获取数据失败");
      }
    } catch (err) {
      setError("获取目录内容时出错");
      console.error("获取目录内容错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 读取文件内容
  const readFile = async (path: string) => {
    setIsLoading(true);
    setError("");
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      console.log("读取文件:", path);

      const response = await fetch(`/api/admin-data?action=read&path=${path}`, {
        headers: {
          "X-Admin-Key": storedAdminKey,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("adminKey");
          setError("会话已过期，请重新登录");
          return;
        }
        throw new Error("读取文件失败");
      }

      const data = await response.json();
      if (data.success) {
        if (data.isDirectory) {
          setContents(data.contents);
          setCurrentPath(path);
          setFileContent("");
          setEditMode(false);
        } else {
          setFileContent(data.content);
          setEditedContent(data.content);
          setCurrentPath(path); // 确保设置当前路径
          setEditMode(false);
          console.log("文件读取成功，当前路径:", path);
        }
      } else {
        setError(data.error || "读取文件失败");
      }
    } catch (err) {
      setError("读取文件时出错");
      console.error("读取文件错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存文件内容
  const saveFile = async (path: string, content: string) => {
    setIsLoading(true);
    setError("");
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      console.log(`尝试保存文件: ${path}`);

      const response = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": storedAdminKey,
        },
        body: JSON.stringify({
          action: "write",
          path,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("adminKey");
          setError("会话已过期，请重新登录");
          return;
        }
        throw new Error(data.error || `保存文件失败: HTTP ${response.status}`);
      }

      if (data.success) {
        setFileContent(content);
        setEditMode(false);
        setError("");
        alert("文件保存成功！");
      } else {
        throw new Error(
          data.error || data.details || "保存文件失败，服务器未返回成功状态"
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`保存文件失败: ${errorMessage}`);
      console.error("保存文件错误:", err);
      alert(`保存文件失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置量子密钥
  const resetQuantumKey = async (date: string) => {
    setIsLoading(true);
    setError("");
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": storedAdminKey,
        },
        body: JSON.stringify({
          action: "reset-key",
          path: date,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("adminKey");
          setError("会话已过期，请重新登录");
          return;
        }
        throw new Error("重置密钥失败");
      }

      const data = await response.json();
      if (data.success) {
        alert(`密钥已重置: ${data.newKey}`);
      } else {
        setError(data.error || "重置密钥失败");
      }
    } catch (err) {
      setError("重置密钥时出错");
      console.error("重置密钥错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文件
  const deleteFile = async (path: string) => {
    if (!window.confirm(`确定要删除文件 "${path}" 吗？此操作不可恢复！`)) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      console.log(`尝试删除文件: ${path}`);

      const response = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": storedAdminKey,
        },
        body: JSON.stringify({
          action: "delete",
          path,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("adminKey");
          setError("会话已过期，请重新登录");
          return;
        }
        throw new Error(data.error || `删除文件失败: HTTP ${response.status}`);
      }

      if (data.success) {
        alert("文件已成功删除！");
        setFileContent("");
        setEditMode(false);
        setError("");
        // 刷新当前目录
        fetchContents(currentPath);
      } else {
        throw new Error(
          data.error || data.details || "删除文件失败，服务器未返回成功状态"
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`删除文件失败: ${errorMessage}`);
      console.error("删除文件错误:", err);
      alert(`删除文件失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除当前文件
  const handleDelete = () => {
    if (!currentPath) {
      setError("无法删除：当前路径为空");
      return;
    }
    deleteFile(currentPath);
  };

  // 处理目录导航
  const handleNavigate = (item: FileItem) => {
    if (item.isDirectory) {
      fetchContents(item.path);
    } else {
      readFile(item.path);
    }
  };

  // 返回上层目录
  const handleBack = () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/");
    fetchContents(parentPath);
    setFileContent("");
    setEditMode(false);
  };

  // 处理文件编辑
  const handleEdit = () => {
    setEditMode(true);
    setEditedContent(fileContent);
  };

  // 处理文件保存
  const handleSave = () => {
    if (!currentPath) {
      setError("无法保存：当前路径为空");
      return;
    }
    console.log("保存文件:", currentPath, "内容长度:", editedContent.length);
    saveFile(currentPath, editedContent);
  };

  // 处理取消编辑
  const handleCancel = () => {
    setEditMode(false);
    setEditedContent(fileContent);
  };

  // 处理退出登录
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminKey");
    setContents([]);
    setCurrentPath("");
    setFileContent("");
    setEditMode(false);
  };

  // 渲染文件列表
  const renderFileList = () => {
    if (isLoading) {
      return <div className="text-center py-4">正在加载...</div>;
    }

    if (error) {
      return (
        <div className="text-red-500 p-3 bg-red-900/20 rounded-md">{error}</div>
      );
    }

    if (contents.length === 0) {
      return <div className="text-center py-4 text-gray-400">此目录为空</div>;
    }

    return (
      <div className="bg-gray-800 rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                大小
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                修改时间
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentPath && (
              <tr
                className="bg-gray-800 hover:bg-gray-700 cursor-pointer"
                onClick={handleBack}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                  ..
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  目录
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  -
                </td>
              </tr>
            )}
            {contents.map((item) => (
              <tr
                key={item.path}
                className="bg-gray-800 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleNavigate(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span
                    className={
                      item.isDirectory ? "text-blue-400" : "text-white"
                    }
                  >
                    {item.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {item.isDirectory ? "目录" : "文件"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {item.isDirectory ? "-" : formatFileSize(item.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(item.modifiedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染文件内容
  const renderFileContent = () => {
    if (!fileContent && !editMode) return null;

    const handleCopy = () => {
      navigator.clipboard
        .writeText(fileContent)
        .then(() => {
          alert("文件内容已复制到剪贴板！");
        })
        .catch((err) => {
          console.error("复制失败:", err);
          alert("复制失败，请手动选择内容并复制");
        });
    };

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-white">
            文件内容: {currentPath}
          </h3>
          <div>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-green-600 text-white rounded-md mr-2 hover:bg-green-700"
                  disabled={isLoading}
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  disabled={isLoading}
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md mr-2 hover:bg-purple-700"
                  disabled={isLoading || !fileContent}
                >
                  复制内容
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md mr-2 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={isLoading}
                >
                  删除
                </button>
              </>
            )}
          </div>
        </div>

        {editMode ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-64 p-3 bg-gray-800 border border-gray-700 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        ) : (
          <pre className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white font-mono text-sm overflow-auto max-h-64">
            {fileContent}
          </pre>
        )}
      </div>
    );
  };

  // 获取当前有效的量子密钥
  const getCurrentValidKey = async () => {
    setIsLoading(true);
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("/api/admin-key", {
        method: "POST",
        headers: {
          "X-Admin-Key": storedAdminKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("adminKey");
          setError("会话已过期，请重新登录");
          return;
        }
        throw new Error("获取当前密钥失败");
      }

      const data = await response.json();
      if (data.success && data.currentKey) {
        setCurrentValidKey(data.currentKey);
      } else {
        setError(data.error || "获取当前密钥失败");
      }
    } catch (err) {
      setError("获取当前密钥时出错");
      console.error("获取当前密钥错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染量子密钥管理
  const renderKeyManagement = () => {
    return (
      <div className="bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium text-white mb-4">量子密钥管理</h3>

        {currentValidKey && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-600/50 rounded-md">
            <h4 className="text-green-300 font-medium mb-1">
              当前有效量子密钥
            </h4>
            <div className="flex items-center gap-2">
              <code className="bg-gray-900 px-3 py-1 rounded text-white font-mono">
                {currentValidKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentValidKey);
                  alert("密钥已复制到剪贴板！");
                }}
                className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                title="复制密钥"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">有效日期: {newKeyDate}</p>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="keyDate"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            密钥日期
          </label>
          <input
            type="date"
            id="keyDate"
            value={newKeyDate}
            onChange={(e) => setNewKeyDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => resetQuantumKey(newKeyDate)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isLoading || !newKeyDate}
          >
            {isLoading ? "处理中..." : "重置量子密钥"}
          </button>

          <button
            onClick={getCurrentValidKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "获取中..." : "获取当前密钥"}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>说明：</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>重置量子密钥将生成一个新的8位随机密钥</li>
            <li>密钥存储在 data/pin/{`{YYYY-MM-DD}`}.txt 文件中</li>
            <li>用户使用量子密钥访问AI预测结果</li>
          </ul>
        </div>
      </div>
    );
  };

  // 渲染IP管理
  const renderIPManagement = () => {
    // 解析JSON格式的IP记录
    const parseIpRecords = () => {
      if (!fileContent || currentPath !== "ip_records.json") return null;

      try {
        const ipData = JSON.parse(fileContent);
        const ipEntries = Object.entries(ipData).map(
          ([ip, data]: [string, any]) => ({
            ip,
            count: data.count || 0,
            lastSubmit: data.lastSubmit
              ? new Date(data.lastSubmit).toLocaleString()
              : "未知",
            blocked: data.blocked || false,
            blockUntil: data.blockUntil
              ? new Date(data.blockUntil).toLocaleString()
              : null,
          })
        );

        return (
          <div className="mt-4 bg-gray-900 rounded-md overflow-hidden border border-gray-700">
            <div className="p-4 bg-gray-800">
              <h4 className="text-gray-200 font-medium">IP记录详情</h4>
              <p className="text-xs text-gray-400 mt-1">
                共 {ipEntries.length} 条IP记录
              </p>
            </div>

            {ipEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        IP地址
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        提交次数
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        最后提交时间
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800">
                    {ipEntries.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-gray-900" : "bg-gray-850"
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          {entry.ip}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {entry.count}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {entry.lastSubmit}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {entry.blocked ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-200">
                              已限制 (至 {entry.blockUntil || "未知"})
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                              正常
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                没有IP记录数据
              </div>
            )}
          </div>
        );
      } catch (error) {
        return (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200">
            <p className="font-medium">无法解析IP记录</p>
            <p className="text-sm mt-1">JSON格式可能不正确</p>
          </div>
        );
      }
    };

    return (
      <div className="bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium text-white mb-4">IP记录管理</h3>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => fetchContents("ip_records.json")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            刷新IP记录列表
          </button>

          <button
            onClick={() => readFile("ip_records.json")}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            查看IP记录内容
          </button>

          {fileContent && currentPath === "ip_records.json" && !editMode && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              编辑记录
            </button>
          )}
        </div>

        {/* 显示解析后的IP记录JSON数据 */}
        {parseIpRecords()}

        {/* 显示IP记录列表 */}
        {currentPath === "" && contents.length > 0 && (
          <div className="mt-4 p-3 bg-gray-900 rounded-md overflow-auto max-h-96">
            <h4 className="text-gray-300 font-medium mb-2">IP记录文件</h4>
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-2 rounded-l">文件名</th>
                  <th className="px-4 py-2">大小</th>
                  <th className="px-4 py-2 rounded-r">修改时间</th>
                </tr>
              </thead>
              <tbody>
                {contents
                  .filter(
                    (item) =>
                      item.name.includes("ip") || item.name.includes("IP")
                  )
                  .map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-800 hover:bg-gray-800"
                    >
                      <td
                        className="px-4 py-2 font-medium text-blue-300 cursor-pointer"
                        onClick={() => handleNavigate(item)}
                      >
                        {item.name}
                      </td>
                      <td className="px-4 py-2">{formatFileSize(item.size)}</td>
                      <td className="px-4 py-2">
                        {new Date(item.modifiedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-sm text-gray-400 mt-4">
          <p>说明：</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>IP记录存储在 data/ip_records.json 文件中</li>
            <li>记录包含用户IP地址和提交次数</li>
            <li>您可以查看和编辑这些记录</li>
            <li>被限制的IP将在限制时间结束后自动解除限制</li>
          </ul>
        </div>
      </div>
    );
  };

  // 渲染购买链接设置
  const renderPurchaseLinkSetting = () => {
    return (
      <div className="bg-gray-800 p-4 rounded-md mt-6">
        <h3 className="text-lg font-medium text-white mb-4">购买链接设置</h3>

        <div className="mb-4">
          <label
            htmlFor="purchaseLink"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            量子密钥购买链接
          </label>
          <input
            type="url"
            id="purchaseLink"
            value={purchaseLink}
            onChange={(e) => setPurchaseLink(e.target.value)}
            placeholder="https://example.com/purchase"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="keyPrice"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            量子密钥价格 (CNY)
          </label>
          <div className="relative">
            <input
              type="number"
              id="keyPrice"
              value={keyPrice}
              onChange={(e) => setKeyPrice(e.target.value)}
              step="0.1"
              min="0"
              placeholder="例如：29.9"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">CNY</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            请输入量子密钥的人民币价格
          </p>
        </div>

        <button
          onClick={savePurchaseLink}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "保存中..." : "保存设置"}
        </button>

        <div className="mt-4 text-sm text-gray-400">
          <p>说明：</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>设置量子密钥的购买链接，会显示在主页上</li>
            <li>链接应为完整的URL（包含http://或https://）</li>
            <li>价格将以人民币(CNY)为单位显示在前端页面</li>
            <li>链接保存在 data/purchase_link.txt 文件中</li>
            <li>价格保存在 data/key_price.txt 文件中</li>
          </ul>
        </div>
      </div>
    );
  };

  // 文件大小格式化
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 加载购买链接和价格
  const loadPurchaseLink = async () => {
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        return;
      }

      // 加载购买链接
      const response = await fetch(
        `/api/admin-data?action=read&path=purchase_link.txt`,
        {
          headers: {
            "X-Admin-Key": storedAdminKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          setPurchaseLink(data.content.trim());
        }
      }

      // 加载价格
      const priceResponse = await fetch(
        `/api/admin-data?action=read&path=key_price.txt`,
        {
          headers: {
            "X-Admin-Key": storedAdminKey,
          },
        }
      );

      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData.success && priceData.content) {
          setKeyPrice(priceData.content.trim());
        }
      }
    } catch (err) {
      console.error("加载购买链接或价格错误:", err);
    }
  };

  // 保存购买链接和价格
  const savePurchaseLink = async () => {
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        setIsAuthenticated(false);
        return;
      }

      // 保存购买链接
      const response = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": storedAdminKey,
        },
        body: JSON.stringify({
          action: "write",
          path: "purchase_link.txt",
          content: purchaseLink,
        }),
      });

      if (!response.ok) {
        throw new Error("保存购买链接失败");
      }

      // 保存价格
      const priceResponse = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": storedAdminKey,
        },
        body: JSON.stringify({
          action: "write",
          path: "key_price.txt",
          content: keyPrice,
        }),
      });

      if (!priceResponse.ok) {
        throw new Error("保存价格失败");
      }

      const data = await response.json();
      if (data.success) {
        alert("购买链接和价格已保存！");
      } else {
        throw new Error("保存购买链接和价格失败");
      }
    } catch (err) {
      alert(
        "保存购买链接和价格失败: " +
          (err instanceof Error ? err.message : String(err))
      );
      console.error("保存购买链接和价格错误:", err);
    }
  };

  // 组件加载时加载购买链接
  useEffect(() => {
    if (isAuthenticated) {
      loadPurchaseLink();
      getCurrentValidKey(); // 添加获取当前密钥
    }
  }, [isAuthenticated]);

  // 如果未认证，显示登录界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-900">
        <div className="max-w-md mx-auto">
          <AdminLogin onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-900">
      {showWelcomeModal && (
        <AdminWelcomeModal onClose={handleCloseWelcomeModal} />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">管理控制面板</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            退出登录
          </button>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab("files");
                  fetchContents();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                文件管理
              </button>
              <button
                onClick={() => setActiveTab("keys")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "keys"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                量子密钥管理
              </button>
              <button
                onClick={() => setActiveTab("predictions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "predictions"
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                预测结果管理
              </button>
              <button
                onClick={() => setActiveTab("ips")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "ips"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                IP记录管理
              </button>
              <button
                onClick={() => setActiveTab("purchase_link")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "purchase_link"
                    ? "border-pink-500 text-pink-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
                }`}
              >
                购买链接设置
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200">
            {error}
          </div>
        )}

        {activeTab === "files" && (
          <div>
            {currentPath && (
              <div className="mb-4 p-2 bg-gray-800 rounded-md overflow-x-auto">
                <span className="text-sm text-gray-400">当前路径: </span>
                <span className="text-white font-mono">
                  /data/{currentPath}
                </span>
              </div>
            )}

            {renderFileList()}
            {renderFileContent()}
          </div>
        )}

        {activeTab === "keys" && renderKeyManagement()}
        {activeTab === "predictions" && (
          <PredictionManager
            isLoading={isLoading}
            error={error}
            setError={setError}
          />
        )}
        {activeTab === "ips" && renderIPManagement()}
        {activeTab === "purchase_link" && renderPurchaseLinkSetting()}
      </div>
    </div>
  );
}
