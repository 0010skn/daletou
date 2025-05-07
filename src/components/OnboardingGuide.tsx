import React, { useState, useEffect, useRef } from "react";

export interface OnboardingStep {
  selector: string;
  text: string;
  customStyles?: React.CSSProperties; // 允许为高亮区域或文本框应用自定义内联样式
  placement?: "top" | "bottom" | "left" | "right" | "center"; // 引导文本框相对于高亮元素的位置
}

export interface OnboardingGuideProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  finishButtonText?: string;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  steps,
  isOpen,
  onComplete,
  onSkip,
  nextButtonText = "下一步",
  skipButtonText = "跳过",
  finishButtonText = "完成",
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElementRect, setHighlightedElementRect] =
    useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isOpen || !currentStep?.selector) {
      setHighlightedElementRect(null);
      return;
    }

    const element = document.querySelector(currentStep.selector);
    if (element) {
      element.scrollIntoView({
        behavior: "auto", // Changed from "smooth" for more reliable rect calculation
        block: "center",
        inline: "center",
      });
      const rect = element.getBoundingClientRect();
      setHighlightedElementRect(rect);
    } else {
      console.warn(
        `OnboardingGuide: Element with selector "${currentStep.selector}" not found.`
      );
      setHighlightedElementRect(null); // 如果找不到元素，则不显示高亮
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    // 重新计算tooltip位置当高亮区域变化或窗口大小变化
    if (highlightedElementRect && tooltipRef.current && overlayRef.current) {
      const tooltip = tooltipRef.current;
      const overlay = overlayRef.current;
      const placement = currentStep.placement || "bottom";

      let top = 0;
      let left = 0;

      const tooltipRect = tooltip.getBoundingClientRect();
      const margin = 10; // 引导框与高亮元素的间距

      switch (placement) {
        case "top":
          top = highlightedElementRect.top - tooltipRect.height - margin;
          left =
            highlightedElementRect.left +
            (highlightedElementRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = highlightedElementRect.bottom + margin;
          left =
            highlightedElementRect.left +
            (highlightedElementRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top =
            highlightedElementRect.top +
            (highlightedElementRect.height - tooltipRect.height) / 2;
          left = highlightedElementRect.left - tooltipRect.width - margin;
          break;
        case "right":
          top =
            highlightedElementRect.top +
            (highlightedElementRect.height - tooltipRect.height) / 2;
          left = highlightedElementRect.right + margin;
          break;
        case "center":
          top =
            highlightedElementRect.top +
            (highlightedElementRect.height - tooltipRect.height) / 2;
          left =
            highlightedElementRect.left +
            (highlightedElementRect.width - tooltipRect.width) / 2;
          break;
      }

      // 确保tooltip在视窗内
      if (top < 0) top = margin;
      if (left < 0) left = margin;
      if (left + tooltipRect.width > overlay.clientWidth)
        left = overlay.clientWidth - tooltipRect.width - margin;
      if (top + tooltipRect.height > overlay.clientHeight)
        top = overlay.clientHeight - tooltipRect.height - margin;

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }
  }, [highlightedElementRect, currentStep?.placement]);

  if (!isOpen || !currentStep) {
    return null;
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
      setCurrentStepIndex(0); // Reset for next time
    }
  };

  const handleSkip = () => {
    onSkip();
    setCurrentStepIndex(0); // Reset for next time
  };

  const highlightStyle: React.CSSProperties = highlightedElementRect
    ? {
        position: "absolute",
        top: `${highlightedElementRect.top}px`,
        left: `${highlightedElementRect.left}px`,
        width: `${highlightedElementRect.width}px`,
        height: `${highlightedElementRect.height}px`,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)", // 遮罩效果
        zIndex: 10001, // 高于遮罩层
        pointerEvents: "none", // 允许点击高亮区域下方的元素 (如果需要)
        borderRadius: "4px", // 轻微圆角
        ...currentStep.customStyles, // 应用步骤特定的自定义样式
      }
    : {};

  const tooltipStyleBase: React.CSSProperties = {
    position: "absolute",
    zIndex: 10002, // 高于高亮区域
    // 默认位置，会被useEffect调整
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] bg-black bg-opacity-0" // 透明背景，高亮区域的box-shadow负责遮罩
      onClick={(e) => {
        // 如果点击的是遮罩本身而不是tooltip或其子元素，则考虑是否跳过或关闭
        // 为简单起见，此处不实现点击遮罩关闭的功能，避免与高亮元素交互冲突
      }}
    >
      {highlightedElementRect && <div style={highlightStyle} />}

      {highlightedElementRect && ( // 仅当元素被找到并高亮时显示引导文本
        <div
          ref={tooltipRef}
          style={tooltipStyleBase}
          className="bg-gray-900 p-4 rounded-lg shadow-xl max-w-xs sm:max-w-sm md:max-w-md border border-yellow-500"
        >
          <p className="text-yellow-400 mb-4 text-sm">{currentStep.text}</p>
          <div className="flex justify-end space-x-2">
            {steps.length > 1 && ( // 如果只有一个步骤，则不显示跳过按钮
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-sm font-medium text-yellow-600 hover:text-yellow-400 bg-gray-800 hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors border border-yellow-600 hover:border-yellow-400"
              >
                {skipButtonText}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition-colors"
            >
              {currentStepIndex === steps.length - 1
                ? finishButtonText
                : nextButtonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingGuide;
