"use client";

import { useEffect, useState } from "react";

interface HistoricalPrediction {
  predictionDate: string; // YYYYMMDD 格式的日期
  predictedNumbers: string[];
  // predictionType: "user" | "ai"; // 根据后端返回的数据结构，这里可能不需要
}

const HistoricalPredictions = () => {
  const [predictions, setPredictions] = useState<HistoricalPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch("/api/history");
        if (!response.ok) {
          throw new Error(
            `获取历史记录失败: ${response.statusText || response.status}`
          );
        }
        const data = await response.json();
        // 确保 data 是一个数组
        if (Array.isArray(data)) {
          setPredictions(data);
        } else {
          console.error("API 返回的不是一个数组:", data);
          setPredictions([]); // 或者 setError("数据格式错误");
        }
      } catch (e: any) {
        setError(e.message || "加载历史数据时发生未知错误");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="card max-w-4xl mx-auto mt-8 p-6 text-center bg-dark-800 text-gold-400">
        正在加载历史预测记录...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-4xl mx-auto mt-8 p-6 text-center bg-dark-800 text-red-400">
        <p className="font-semibold">加载历史数据失败:</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="card max-w-4xl mx-auto mt-8 relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 gold-text text-center">
        历史预测记录
      </h2>
      {predictions.length === 0 ? (
        <div className="p-8 text-center bg-dark-900 rounded-md">
          <p className="text-gray-300">暂无历史预测记录。</p>
          <p className="text-sm text-gray-500 mt-2">
            当您提交新的预测后，会在这里显示。
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-900 shadow-md rounded-lg border border-gold-700/30">
            <thead className="bg-dark-800 text-gold-300">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">预测日期</th>
                <th className="py-3 px-4 text-left font-semibold">预测号码</th>
                {/* <th className="py-3 px-4 text-left font-semibold">原始ID</th> */}
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {predictions.map((prediction, index) => (
                <tr
                  key={`${prediction.predictionDate}-${index}`} // 使用 predictionDate 作为 key 的一部分
                  className="border-b border-gold-700/20 hover:bg-dark-800/60 transition-colors"
                >
                  <td className="py-3 px-4">{prediction.predictionDate}</td>
                  <td className="py-3 px-4 font-mono">
                    {prediction.predictedNumbers.map((numSet, setIndex) => (
                      <span
                        key={setIndex}
                        className="block sm:inline-block mr-2 mb-1 sm:mb-0 p-1 px-2 border border-gold-600/30 rounded bg-dark-800 text-gold-400 text-sm"
                      >
                        {Array.isArray(numSet) ? numSet.join(", ") : numSet}
                      </span>
                    ))}
                  </td>
                  {/* <td className="py-3 px-4">{prediction.drawNumber}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoricalPredictions;
