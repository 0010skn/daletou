"use client";

import { useState, useEffect } from "react";
import { formatDate, getCurrentDrawNumber, eventBus } from "@/lib/utils";
import { CrownIcon } from "./icons";

export default function DrawInfo() {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isDrawDay, setIsDrawDay] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [nextDrawDate, setNextDrawDate] = useState("");
  const [totalTickets, setTotalTickets] = useState<number | null>(null);
  const [currentDraw, setCurrentDraw] = useState("");

  // 获取统计数据的函数
  async function fetchStats() {
    try {
      // 添加缓存破坏参数，确保获取最新数据
      const response = await fetch(`/api/stats?t=${Date.now()}`);
      const data = await response.json();
      if (data.totalTickets !== undefined) {
        setTotalTickets(data.totalTickets);
      }
    } catch (error) {
      console.error("获取统计数据失败", error);
    }
  }

  // 获取统计数据
  useEffect(() => {
    fetchStats();

    // 订阅彩票数据更新事件
    const handleDataUpdated = () => {
      console.log("收到数据更新事件，重新获取统计数据");
      fetchStats();
    };

    eventBus.on("lottery-data-updated", handleDataUpdated);

    // 每5分钟刷新一次数据
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      eventBus.off("lottery-data-updated", handleDataUpdated);
    };
  }, []);

  useEffect(() => {
    // 设置当前期号
    setCurrentDraw(getCurrentDrawNumber());

    // 计算倒计时，每秒更新一次
    const updateCountdown = () => {
      const now = new Date();

      // 获取当天21:30的时间
      const drawTime = new Date(now);
      drawTime.setHours(21, 30, 0, 0);

      // 判断今天是否开奖日（周一=1, 周三=3, 周六=6）
      const today = now.getDay();
      const isToday = today === 1 || today === 3 || today === 6;

      setIsDrawDay(isToday);

      // 计算下一个开奖日
      let nextDrawDay = now;
      if (!isToday || now > drawTime) {
        // 如果今天不是开奖日或者已经过了开奖时间，找到下一个开奖日
        const daysToAdd =
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

        nextDrawDay = new Date(now);
        nextDrawDay.setDate(now.getDate() + daysToAdd);
        nextDrawDay.setHours(21, 30, 0, 0);
      } else {
        nextDrawDay = drawTime;
      }

      // 设置下一个开奖日期时间
      setNextDrawDate(formatDate(nextDrawDay));

      // 如果今天是开奖日且未到开奖时间，显示倒计时
      if (isToday && now < drawTime) {
        const timeDiff = drawTime.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
        setShowCountdown(true);
      } else {
        setShowCountdown(false);
      }
    };

    // 首次渲染时更新，然后每秒更新一次
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card max-w-4xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <CrownIcon className="w-full h-full text-gold-400" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold gold-text">期号</h2>
          <span className="ml-3 text-2xl font-bold text-gold-400">
            {currentDraw}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm">
          <div>
            <p className="text-gray-400">下一期开奖日期:</p>
            <p className="text-white">{nextDrawDate}</p>
          </div>

          <div>
            <p className="text-gray-400">开奖时间:</p>
            <p className="text-white">21:30</p>
          </div>

          {totalTickets !== null && (
            <div>
              <p className="text-gray-400 flex items-center">
                已收集注数:
                <button
                  onClick={() => fetchStats()}
                  className="ml-1 text-xs text-gold-400 hover:text-gold-300"
                  title="刷新数据"
                >
                  ↻
                </button>
              </p>
              <p className="text-white font-bold text-gold-300">
                {totalTickets}注
              </p>
            </div>
          )}
        </div>
      </div>

      {isDrawDay && (
        <div className="flex-shrink-0 text-right">
          <div className="text-gray-300 mb-1">
            今日是<span className="ml-1 text-gold-300 font-medium">开奖日</span>
          </div>

          {showCountdown && (
            <div className="mt-1">
              <span className="text-sm text-gray-400">距离开奖:</span>
              <span className="ml-2 px-3 py-1 bg-dark-900 text-gold-400 rounded-full font-mono font-medium border border-gold-700/30">
                {timeRemaining}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
