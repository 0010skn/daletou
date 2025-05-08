import React from "react";

interface NumberBallProps {
  number: string | number;
  color: "red" | "blue" | string; // 允许 'red', 'blue' 或其他颜色字符串
}

const NumberBall: React.FC<NumberBallProps> = ({ number, color }) => {
  const ballColor =
    color === "red" ? "#FF5252" : color === "blue" ? "#448AFF" : color;
  const textColor = "#FFFFFF"; // 白色文字
  const svgSize = 32; // SVG 尺寸，可以根据需要调整
  const circleRadius = svgSize / 2 - 1; // 圆形半径，留出1px边框空间（如果需要）
  const fontSize = (svgSize / 2) * 0.9; // 字体大小，根据SVG尺寸调整
  const textYPosition = svgSize / 2 + fontSize / 3; // 调整文字垂直居中

  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
      <circle
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={circleRadius}
        fill={ballColor}
      />
      <text
        x="50%"
        y={textYPosition}
        textAnchor="middle"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="Arial, sans-serif" // 使用通用字体
      >
        {number}
      </text>
    </svg>
  );
};

export default NumberBall;
