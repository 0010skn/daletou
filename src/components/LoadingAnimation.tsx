"use client";

import React from "react";

interface LoadingAnimationProps {
  message: string;
}

export default function LoadingAnimation({ message }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-2">
      <div className="relative w-16 h-16">
        {/* 外环 */}
        <div className="absolute inset-0 border-4 border-gold-200/30 rounded-full"></div>

        {/* 旋转光环 */}
        <div className="absolute inset-0 border-t-4 border-gold-400 rounded-full animate-spin"></div>

        {/* 中心点 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gold-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 消息文本 */}
      <p className="text-gold-300 font-medium text-center">{message}</p>
    </div>
  );
}

// 用于显示多条预测中消息的组件
export function PredictionLoading({ messages }: { messages: string[] }) {
  return (
    <div className="grid gap-6 py-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className="bg-dark-800/50 backdrop-blur-sm border border-gold-500/20 rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:border-gold-500/40"
        >
          <div className="w-8 h-8 flex-shrink-0 relative">
            <div className="absolute inset-0 border-2 border-gold-300/20 rounded-full"></div>
            <div
              className="absolute inset-0 border-t-2 border-gold-400 rounded-full animate-spin"
              style={{ animationDuration: `${(index + 2) * 1}s` }}
            ></div>
          </div>
          <span className="text-gold-100 font-medium">{message}</span>
        </div>
      ))}
    </div>
  );
}
