import React from "react";

interface LotteryIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function LotteryIcon({
  className = "",
  width = 24,
  height = 24,
}: LotteryIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="15" r="5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
      <path d="M19 9h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}
