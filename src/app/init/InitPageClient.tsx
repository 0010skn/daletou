"use client";

import React from "react";

interface InitPageClientProps {
  adminPath: string;
  adminKey: string;
}

export default function InitPageClient({
  adminPath,
  adminKey,
}: InitPageClientProps) {
  const handleCopyClick = () => {
    // 创建要复制的文本
    const textToCopy = `管理面板地址: /${adminPath}\n管理员密钥: ${adminKey}\n完整URL: http://您的网站域名/${adminPath}`;

    // 复制到剪贴板
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => alert("管理信息已复制到剪贴板！"))
      .catch((err) => console.error("复制失败:", err));
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-4 shadow-2xl border-2 border-red-600/70 overflow-hidden">
        <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-red-900/50 to-amber-900/50">
          <h3 className="text-xl font-bold text-red-300 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
            系统初始化 - 重要信息（仅显示一次）
          </h3>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-400 mx-auto mb-4 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-white text-center mb-3 font-bold text-xl">
              系统初始化完成
            </p>
            <p className="text-gray-300 text-sm mb-3">
              请立即保存以下管理信息，此页面
              <span className="font-bold text-red-400"> 仅显示一次 </span>
              ，刷新后将无法再次访问！
            </p>

            <div className="mb-4">
              <h4 className="text-amber-400 font-medium mb-1">
                管理面板地址：
              </h4>
              <div className="p-3 bg-gray-900 rounded-md border border-amber-600 mb-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent animate-pulse"></div>
                <p className="font-mono text-center text-amber-400 break-all text-lg relative z-10">
                  /{adminPath}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-green-400 font-medium mb-1">管理员密钥：</h4>
              <div className="p-3 bg-gray-900 rounded-md border border-green-600 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent animate-pulse"></div>
                <p className="font-mono text-center text-green-400 break-all text-lg">
                  {adminKey}
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-2">
              访问管理面板的完整URL为：
            </p>
            <div className="p-2 bg-gray-900 rounded-md border border-gray-700 text-xs mb-4">
              <code className="text-blue-400 break-all">
                http://您的网站域名/{adminPath}
              </code>
            </div>
            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-md mt-4">
              <p className="text-red-300 text-sm font-semibold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                警告：此页面仅显示一次，请立即记录上述信息！刷新页面后将无法再次访问。
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-b-lg flex justify-between border-t border-gray-700">
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            返回首页
          </a>
          <button
            onClick={handleCopyClick}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded hover:from-amber-500 hover:to-amber-400 transition-colors font-medium"
          >
            复制管理信息
          </button>
        </div>
      </div>
    </div>
  );
}
