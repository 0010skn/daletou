"use client";

import { useState, useEffect } from "react";

interface AdminWelcomeModalProps {
  onClose: () => void;
}

export default function AdminWelcomeModal({ onClose }: AdminWelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-4 shadow-2xl border border-amber-600/30 animate-fadeIn">
        <div className="p-5 border-b border-gray-700">
          <h3 className="text-xl font-bold text-amber-400">重要提示</h3>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-amber-400 mx-auto mb-4"
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
            <p className="text-white text-center mb-3">
              欢迎使用大乐透AI量化分析系统管理面板
            </p>
            <p className="text-gray-300 text-sm mb-2">
              注意：此消息只会显示
              <span className="text-amber-400 font-bold">一次</span>！
            </p>
            <ul className="text-gray-300 text-sm space-y-2 mt-4">
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>请妥善保管您的管理员密钥，不要泄露给他人</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>定期备份您的数据，可在文件管理中下载重要文件</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>使用管理面板修改任何设置前，请确保您了解其影响</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>如有任何问题，请联系技术支持</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-b-lg flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            我已了解（不再显示）
          </button>
        </div>
      </div>
    </div>
  );
}
