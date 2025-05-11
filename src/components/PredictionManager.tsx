"use client";

import { useState, useEffect } from "react";

interface PredictionManagerProps {
  isLoading: boolean;
  error: string;
  setError: (error: string) => void;
}

export default function PredictionManager({
  isLoading,
  error,
  setError,
}: PredictionManagerProps) {
  // 状态管理
  const [issueNumber, setIssueNumber] = useState(() => {
    // 默认当前日期作为期号 (YYMMDD格式)
    const today = new Date();
    const year = today.getFullYear().toString().slice(2);
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return year + month + day;
  });
  const [fileContent, setFileContent] = useState("");
  const [status, setStatus] = useState("");
  const [existingFiles, setExistingFiles] = useState<any[]>([]);

  // 获取所有预测文件列表
  const fetchPredictionFiles = async () => {
    try {
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        return;
      }

      const response = await fetch(`/api/admin-data?action=list&path=`, {
        headers: {
          "X-Admin-Key": storedAdminKey,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setExistingFiles([]);
          return;
        }
        throw new Error("获取预测结果列表失败");
      }

      const data = await response.json();
      if (data.success && data.contents) {
        // 筛选出预测结果文件 (格式为：{期号}_result.txt)
        const resultFiles = data.contents.filter(
          (file) => !file.isDirectory && file.name.endsWith("_result.txt")
        );
        setExistingFiles(resultFiles);
      }
    } catch (err) {
      console.error("获取预测文件列表错误:", err);
    }
  };

  // 读取预测文件内容
  const readPredictionFile = async (fileName: string) => {
    try {
      setStatus(`正在加载文件：${fileName}...`);
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        return;
      }

      const response = await fetch(
        `/api/admin-data?action=read&path=${fileName}`,
        {
          headers: {
            "X-Admin-Key": storedAdminKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setFileContent("");
          setStatus(`文件 ${fileName} 不存在，可以创建新文件`);
          return;
        }
        throw new Error("读取预测文件失败");
      }

      const data = await response.json();
      if (data.success) {
        setFileContent(data.content);
        setStatus(`成功加载文件：${fileName}`);

        // 从文件名中提取期号 (去掉_result.txt后缀)
        const issueNum = fileName.replace("_result.txt", "");
        setIssueNumber(issueNum);
      }
    } catch (err) {
      const errMsg =
        "读取预测文件失败：" +
        (err instanceof Error ? err.message : String(err));
      console.error(errMsg, err);
      setError(errMsg);
    }
  };

  // 保存预测文件
  const savePredictionFile = async () => {
    try {
      if (!issueNumber.trim()) {
        setError("请输入有效的期号");
        return;
      }

      // 验证每行是否为有效的号码格式
      const lines = fileContent.trim().split("\n");
      if (lines.length === 0) {
        setError("请输入有效的预测号码");
        return;
      }

      setStatus("正在保存预测文件...");
      const storedAdminKey = sessionStorage.getItem("adminKey");
      if (!storedAdminKey) {
        return;
      }

      const fileName = `${issueNumber}_result.txt`;

      const response = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": storedAdminKey,
        },
        body: JSON.stringify({
          action: "write",
          path: fileName,
          content: fileContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`保存文件失败：HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStatus(`文件 ${fileName} 已成功保存`);
        // 刷新文件列表
        fetchPredictionFiles();
      } else {
        throw new Error(data.error || "保存文件失败");
      }
    } catch (err) {
      const errMsg =
        "保存预测文件失败：" +
        (err instanceof Error ? err.message : String(err));
      console.error(errMsg, err);
      setError(errMsg);
    }
  };

  // 创建预测结果文件
  const createEmptyFile = () => {
    setFileContent("");
    setStatus(`已创建空白文件，请输入预测内容，每行一注`);
  };

  // 组件加载时获取文件列表
  useEffect(() => {
    fetchPredictionFiles();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-md">
      <h3 className="text-lg font-medium text-white mb-4">预测结果管理</h3>

      {status && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-800 rounded-md text-blue-200">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-3">
          <label
            htmlFor="issueNumber"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            期号
          </label>
          <input
            type="text"
            id="issueNumber"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
            placeholder="例如: 230506"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={createEmptyFile}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            新建空白文件
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="fileContent"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          预测内容（每行一注，例如：0102030405+0607）
        </label>
        <textarea
          id="fileContent"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="w-full h-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0102030405+0607
0809101112+0102
..."
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={savePredictionFile}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "保存中..." : "保存预测文件"}
        </button>
      </div>

      {/* 已有预测文件列表 */}
      {existingFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-white mb-2">已有预测文件</h4>
          <div className="bg-gray-900 p-3 rounded-md">
            <div className="flex flex-wrap gap-2">
              {existingFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => readPredictionFile(file.name)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        <p>说明：</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>输入期号并创建预测文件</li>
          <li>在文本框中输入预测内容，每行一注</li>
          <li>每注格式：前区5个号码+后区2个号码，例如：0102030405+0607</li>
          <li>保存后文件将存储在 data/{"{期号}"}_result.txt</li>
          <li>点击已有预测文件名可以加载并编辑</li>
        </ul>
      </div>
    </div>
  );
}
