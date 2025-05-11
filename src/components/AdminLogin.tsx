"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LockIcon from "./icons/LockIcon";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= 5) {
      setError("尝试次数过多，请稍后再试");
      return;
    }

    if (!adminKey.trim()) {
      setError("请输入管理员密钥");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("adminKey", adminKey);
        onSuccess();
      } else {
        setAttempts((prev) => prev + 1);
        setError(data.message || "管理员密钥验证失败");
      }
    } catch (err) {
      setError("验证过程中发生错误，请重试");
      console.error("管理员验证错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      <div className="text-center mb-6">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-indigo-900/30 rounded-full mb-4">
          <LockIcon className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">管理员验证</h2>
        <p className="text-gray-400 text-sm mt-1">
          请输入管理员密钥以访问控制面板
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="adminKey"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            管理员密钥
          </label>
          <input
            type="password"
            id="adminKey"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="输入您的管理员密钥"
            disabled={isLoading || attempts >= 5}
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-900/40 border border-red-800 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || attempts >= 5}
          className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading || attempts >= 5
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isLoading ? "验证中..." : "登录"}
        </button>

        {attempts > 0 && attempts < 5 && (
          <p className="mt-2 text-center text-xs text-amber-400">
            剩余尝试次数: {5 - attempts}
          </p>
        )}
      </form>
    </div>
  );
}
