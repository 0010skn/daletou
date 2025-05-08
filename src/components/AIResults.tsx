"use client";

import { useState, useEffect } from "react";
import { formatLotteryNumber, parseLotteryNumbers } from "@/lib/utils"; //移除了 getCurrentDrawNumber
import { getAiAnalysisResult } from "@/app/server/data";
import { GraphIcon } from "./icons";
import NumberBall from "./icons/NumberBall"; // 导入 NumberBall 组件

interface AIResultsProps {
  currentDrawNumber: string;
}

export default function AIResults({ currentDrawNumber }: AIResultsProps) {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    console.log(
      "AIResults: useEffect triggered. Timestamp:",
      new Date().toISOString()
    );
    async function fetchData() {
      console.log(
        "AIResults: fetchData called. Timestamp:",
        new Date().toISOString()
      );
      try {
        const fetchedResults = await getAiAnalysisResult();
        console.log(
          "AIResults: getAiAnalysisResult successful. Results:",
          fetchedResults,
          "Timestamp:",
          new Date().toISOString()
        );
        setResults(fetchedResults);
      } catch (error) {
        console.error(
          "AIResults: Error in fetchData:",
          error,
          "Timestamp:",
          new Date().toISOString()
        );
      }
    }
    fetchData();
  }, []);

  // 计算距离开奖的时间（开奖时间为每周一、三、六晚上21:30）
  const now = new Date();

  // 获取当天21:30的时间
  const drawTime = new Date(now);
  drawTime.setHours(21, 30, 0, 0);

  // 判断今天是否开奖日（周一=1, 周三=3, 周六=6）
  const today = now.getDay();
  const isDrawDay = today === 1 || today === 3 || today === 6;

  // 计算距离开奖的时间
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

  // 为了开发和演示目的，始终显示结果
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

      {showPrediction && results.length === 0 && (
        <div className="p-8 text-center bg-dark-900 rounded-md">
          <p className="text-gray-300">暂无AI预测结果</p>
          <p className="text-sm text-gray-500 mt-2">
            请稍后刷新页面查看最新结果
          </p>
        </div>
      )}

      {showPrediction && results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gold-300">
            本期AI推荐号码（共{results.length}注）:
          </h3>
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
