"use client";

import { useEffect } from "react";
import { Button } from "@nextui-org/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">出错了</h2>
        <p className="text-gray-600 mb-6">
          很抱歉，系统处理您的请求时遇到了问题。请稍后再试。
        </p>
        <div className="flex justify-center">
          <Button color="primary" onClick={() => reset()} className="mx-2">
            重试
          </Button>
          <Button
            color="default"
            onClick={() => (window.location.href = "/")}
            className="mx-2"
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
