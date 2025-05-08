"use client";

import React, { useEffect, useState } from "react";
import NumberBall from "./icons/NumberBall"; // 导入 NumberBall 组件
import { parseLotteryNumbers } from "@/lib/utils";

interface DrawData {
  lotteryDrawNum: string;
  lotteryDrawResult: string;
  lotteryDrawTime: string;
}

const HistoricalDraws: React.FC = () => {
  const [history, setHistory] = useState<DrawData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // 如果API需要body，可以在这里添加
          // body: JSON.stringify({}),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json(); // 首先获取整个JSON对象
        if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
          setHistory(jsonData.data);
          setError(null);
        } else {
          // 如果响应中没有 data 数组，或者 data 不是数组，则抛出错误或设置为空数组
          console.error("API响应格式不正确或data字段缺失/非数组:", jsonData);
          throw new Error("API响应格式不正确");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("获取历史数据时发生未知错误");
        }
        console.error("获取历史数据失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div style={styles.loading}>加载历史开奖数据中...</div>;
  }

  if (error) {
    return <div style={styles.error}>加载历史数据出错: {error}</div>;
  }

  if (history.length === 0) {
    return <div style={styles.container}>暂无历史开奖数据。</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>历史开奖数据</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>期号</th>
              <th style={styles.th}>开奖结果</th>
              <th style={styles.th}>开奖日期</th>
            </tr>
          </thead>
          <tbody>
            {history.map((draw, index) => {
              const { redBalls, blueBalls } = parseLotteryNumbers(
                draw.lotteryDrawResult
              );
              return (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{draw.lotteryDrawNum}</td>
                  <td
                    style={{
                      ...styles.td,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    {redBalls.map((ball, ballIndex) => (
                      <NumberBall
                        key={`red-${index}-${ballIndex}`}
                        number={ball}
                        color="red"
                      />
                    ))}
                    <span style={{ margin: "0 4px", color: "#e0e0e0" }}>+</span>
                    {blueBalls.map((ball, ballIndex) => (
                      <NumberBall
                        key={`blue-${index}-${ballIndex}`}
                        number={ball}
                        color="blue"
                      />
                    ))}
                  </td>
                  <td style={styles.td}>
                    {new Date(draw.lotteryDrawTime).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: "#1a1a1a", // 深色背景
    color: "#ffd700", // 金色文字
    padding: "20px",
    borderTop: "2px solid #ffd700", // 金色边框
    fontFamily: "Arial, sans-serif",
    marginTop: "20px", // 与页面其他内容隔开
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#f0e68c", // 淡金色
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #ffd700",
    padding: "10px",
    backgroundColor: "#333", // 表头深色背景
    color: "#ffd700",
    textAlign: "center",
  },
  tr: {
    borderBottom: "1px solid #444", // 行分隔线
  },
  td: {
    border: "1px solid #c0c0c0", // 稍浅的边框
    padding: "10px",
    textAlign: "center",
    color: "#e0e0e0", // 亮色文字
    verticalAlign: "middle", // 确保内容垂直居中
  },
  // redBalls 和 blueBall 样式不再需要，颜色由 NumberBall 组件处理
  loading: {
    textAlign: "center",
    padding: "20px",
    fontSize: "18px",
    color: "#ffd700",
    backgroundColor: "#1a1a1a",
  },
  error: {
    textAlign: "center",
    padding: "20px",
    fontSize: "18px",
    color: "#ff4d4d", // 错误用红色
    backgroundColor: "#1a1a1a",
  },
};

export default HistoricalDraws;
