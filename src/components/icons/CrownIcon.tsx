import React from "react";

interface CrownIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function CrownIcon({
  className = "",
  width = 24,
  height = 24,
}: CrownIconProps) {
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
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
