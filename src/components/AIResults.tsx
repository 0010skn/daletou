"use client";

import { useState, useEffect } from "react";
import { formatLotteryNumber, parseLotteryNumbers } from "@/lib/utils"; //移除了 getCurrentDrawNumber
import { getAiAnalysisResult, verifyAccessCode } from "@/app/server/data";
import { GraphIcon } from "./icons";
import LockIcon from "./icons/LockIcon"; // 从单独的文件导入
import NumberBall from "./icons/NumberBall"; // 导入 NumberBall 组件
import crypto from "crypto";
import { PredictionLoading } from "./LoadingAnimation"; // 导入预测加载组件
import PurchaseLink from "./PurchaseLink"; // 导入购买链接组件

interface AIResultsProps {
  currentDrawNumber: string;
}

export default function AIResults({ currentDrawNumber }: AIResultsProps) {
  const [results, setResults] = useState<string[]>([]);
  const [accessCode, setAccessCode] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showSuccessAnimation, setShowSuccessAnimation] =
    useState<boolean>(false);
  const [encryptedKey, setEncryptedKey] = useState<string>("");
  const [userIP, setUserIP] = useState<string>("unknown");

  useEffect(() => {
    const fetchUserIP = async () => {
      try {
        // 使用本地API获取IP地址（从请求头中获取）
        const response = await fetch("/api/get-client-ip");
        if (response.ok) {
          const data = await response.json();
          if (data.ip) {
            setUserIP(data.ip);
          }
        } else {
          // 如果获取失败，使用会话存储随机生成一个标识符
          let sessionId = sessionStorage.getItem("userSessionId");
          if (!sessionId) {
            // 生成一个随机会话ID
            sessionId =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem("userSessionId", sessionId);
          }
          setUserIP(`session_${sessionId}`);
        }
      } catch (error) {
        // 出错时也使用会话ID
        let sessionId = sessionStorage.getItem("userSessionId");
        if (!sessionId) {
          sessionId =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem("userSessionId", sessionId);
        }
        setUserIP(`session_${sessionId}`);
      }
    };

    fetchUserIP();
  }, []);

  // 组件加载时触发密钥检查
  useEffect(() => {
    // 调用密钥检查API
    const checkKey = async () => {
      try {
        const response = await fetch("/api/key-check");
        const data = await response.json();

        if (data.success && data.encryptedKey) {
          // 设置从API获取的加密密钥
          setEncryptedKey(data.encryptedKey);
          console.log("密钥检查完成，获取到加密密钥");
        } else {
          console.log("密钥检查完成，但未获取到加密密钥");
        }
      } catch (error) {
        console.error("密钥检查请求失败:", error);
      }
    };

    checkKey();
  }, []);

  // 生成密钥的MD5值
  const generateEncryptedKey = (key: string): string => {
    return crypto.createHash("md5").update(key).digest("hex");
  };

  // 处理表单提交
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    // 触发验证
    if (accessCode.trim()) {
      verifyKey();
    }
  };

  // 实时验证量子预测密钥
  const verifyKey = async () => {
    if (!accessCode.trim()) {
      setErrorMessage("");
      return;
    }

    setIsSubmitting(true);
    try {
      // 传递用户IP进行验证，增加防暴力破解
      const result = await verifyAccessCode(accessCode, userIP);

      if (result.success) {
        setErrorMessage("");
        // 生成并保存加密后的密钥
        const md5Key = generateEncryptedKey(accessCode);
        setEncryptedKey(md5Key);
        setShowSuccessAnimation(true);

        // 显示成功动画后再设置验证成功
        setTimeout(() => {
          setIsVerified(true);
          // 验证成功后获取AI预测结果
          getAiAnalysisResult().then((fetchedResults) => {
            setResults(fetchedResults);
          });
        }, 1000);
      } else {
        setIsVerified(false);
        setShowSuccessAnimation(false);
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("验证量子预测密钥时出错:", error);
      setErrorMessage("系统错误，请稍后再试");
      setShowSuccessAnimation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 当用户输入代码时不再立即验证，防止多次尝试
  useEffect(() => {
    if (accessCode.length >= 8) {
      setIsSubmitting(true);
      const debounceTimeout = setTimeout(verifyKey, 500);
      return () => clearTimeout(debounceTimeout);
    }
  }, [accessCode]);

  // 计算时间
  const now = new Date();
  const today = now.getDay(); // 0是周日，1-6是周一到周六

  // 开奖日是周一、周三、周六，即 1, 3, 6
  const isDrawDay = today === 1 || today === 3 || today === 6;

  // 开奖时间为21:15
  const drawTime = new Date(now);
  drawTime.setHours(21, 15, 0, 0);

  let timeRemaining = "";
  let showPrediction = false;

  if (isDrawDay && now < drawTime) {
    // 今天是开奖日，且还未到开奖时间
    const diffHours = Math.floor(
      (drawTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor(
      ((drawTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)
    );

    timeRemaining = `距离今日开奖还有 ${diffHours} 小时 ${diffMinutes} 分钟`;
    showPrediction = diffHours <= 3; // 开奖前3小时内显示预测结果
  } else if (isDrawDay) {
    // 今天是开奖日，已过开奖时间
    timeRemaining = "今日已开奖";
    showPrediction = true;
  } else {
    // 不是开奖日
    // 找到下一个开奖日
    const daysToNext =
      today === 0
        ? 1 // 周日->周一(+1)
        : today === 1
        ? 2 // 周一->周三(+2)
        : today === 2
        ? 1 // 周二->周三(+1)
        : today === 3
        ? 3 // 周三->周六(+3)
        : today === 4
        ? 2 // 周四->周六(+2)
        : today === 5
        ? 1 // 周五->周六(+1)
        : 1; // 周六->周一(+1)

    timeRemaining = `距下期开奖还有 ${daysToNext} 天`;
    showPrediction = false;
  }

  // 为了开发和演示目的，始终显示结果区域
  showPrediction = true;

  return (
    <div className="card max-w-4xl mx-auto mt-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5">
        <GraphIcon className="w-full h-full text-gold-400" />
      </div>

      <h2 className="text-2xl font-bold mb-4 gold-text">AI量化分析结果</h2>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="text-gray-400">当前期号: </span>
          <span className="font-medium text-gold-400">{currentDrawNumber}</span>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 text-sm rounded-full ${
              showPrediction
                ? "bg-dark-900 text-gold-400 border border-gold-800/30"
                : "bg-dark-900 text-gray-400 border border-gray-800"
            }`}
          >
            {timeRemaining}
          </span>
        </div>
      </div>

      {!showPrediction && (
        <div className="p-8 text-center bg-dark-900 rounded-md">
          <p className="text-gray-300">AI预测结果将在开奖前3小时公布</p>
          <p className="text-sm text-gray-500 mt-2">
            请在开奖日当天返回查看结果
          </p>
        </div>
      )}

      {showPrediction && !isVerified && (
        <div className="p-8 text-center bg-dark-950 rounded-md border border-gold-700/30">
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center border ${
                showSuccessAnimation
                  ? "border-green-500 animate-pulse"
                  : "border-gold-600/20"
              } transition-all duration-300`}
            >
              {showSuccessAnimation ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-400 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <LockIcon className="w-8 h-8 text-gold-400" />
              )}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gold-300">
            {showSuccessAnimation ? "正在解密预测结果..." : "AI预测结果已加密"}
          </h3>

          {encryptedKey && (
            <div className="p-2 mb-4 bg-dark-900/60 border border-gold-600/20 rounded-md">
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
                这是您的身份验证信息，请勿泄露
              </p>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <span className="font-mono text-gold-400">{encryptedKey}</span>
              </p>
            </div>
          )}

          <p className="text-gray-300 mb-6">
            {showSuccessAnimation
              ? "量子密钥验证成功，正在获取预测数据..."
              : "输入量子预测密钥解锁查看本期AI量化分析结果"}
          </p>

          {!showSuccessAnimation && (
            <form onSubmit={handleVerifyCode} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="请输入量子预测密钥"
                  className="flex-1 px-4 py-3 bg-dark-800 border border-gold-600/30 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-400 rounded-lg text-black font-medium hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "验证中..." : "解锁"}
                </button>
              </div>

              {errorMessage && (
                <p className="mt-3 p-2 text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    {errorMessage}
                  </span>
                </p>
              )}

              <p className="mt-6 text-sm text-gray-400">
                理性消费，量力而行，切勿沉迷
              </p>

              <div className="mt-4">
                <PurchaseLink />
              </div>
            </form>
          )}
        </div>
      )}

      {showPrediction && isVerified && results.length === 0 && (
        <div className="p-8 text-center bg-dark-900 rounded-md">
          <p className="text-gray-300">暂无AI预测结果</p>
          <p className="text-sm text-gray-500 mt-2">
            请稍后刷新页面查看最新结果
          </p>
        </div>
      )}

      {showPrediction && isVerified && results.length > 0 && (
        <div>
          <div className="p-3 mb-4 bg-green-900/20 border border-green-600/30 rounded-md">
            <p className="text-green-400 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span>
                您的个人身份验证信息:{" "}
                <span className="font-semibold">{encryptedKey}</span> (请勿泄露)
              </span>
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-3 text-gold-300">
            本期AI推荐号码（共{results.length}注）:
          </h3>

          {/* 根据结果内容判断是否显示正在预测中的动画 */}
          {results.length < 3 ||
          results[0].startsWith("⌛") ||
          results[0].startsWith("⏳") ? (
            <div className="bg-dark-900/70 backdrop-blur-sm border border-gold-700/30 rounded-lg p-6">
              <PredictionLoading messages={results} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((result, index) => {
                const { redBalls, blueBalls } = parseLotteryNumbers(result);

                return (
                  <div
                    key={index}
                    className="p-3 border border-gold-700/30 rounded-lg bg-dark-900 flex flex-col items-start group hover:border-gold-500/70 transition-all"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {redBalls.map((ball, ballIndex) => (
                        <NumberBall
                          key={`red-${index}-${ballIndex}`}
                          number={ball}
                          color="red"
                        />
                      ))}
                      {blueBalls.map((ball, ballIndex) => (
                        <NumberBall
                          key={`blue-${index}-${ballIndex}`}
                          number={ball}
                          color="blue"
                        />
                      ))}
                    </div>
                    <span className="text-gold-500 text-xs opacity-70 group-hover:opacity-100 self-end">
                      #{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-dark-900 border-l-4 border-gold-600 text-gray-300 rounded-r">
        <p className="text-sm">
          <span className="font-bold text-gold-300">AI量化分析说明：</span>{" "}
          本系统基于收集的真实随机大乐透号码，通过先进的AI算法进行深度分析，在开奖前3小时给出20注推荐号码。
        </p>
      </div>
    </div>
  );
}
