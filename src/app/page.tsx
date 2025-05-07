"use client"; // OnboardingGuide 和 cache hook 需要在客户端运行

import { useState, useEffect } from "react";
import LotteryForm from "@/components/LotteryForm";
import AIResults from "@/components/AIResults";
import HistoricalPredictions from "@/components/HistoricalPredictions";
import DrawInfo from "@/components/DrawInfo";
import { CrownIcon } from "@/components/icons";
import OnboardingGuide from "@/components/OnboardingGuide"; // 导入 OnboardingGuide
import { useOnboardingCache } from "@/lib/onboardingCache"; // 导入 useOnboardingCache

const steps = [
  {
    selector: "h1.gold-text",
    text: "欢迎使用大乐透AI量化分析系统",
  },
  {
    selector: "#lottery-form-section",
    text: "在这里，您可以上传您购买的大乐透号码。",
  },
  {
    selector: "#ai-results-section",
    text: "AI分析结果将在这里展示，帮助您了解号码的潜在趋势。",
  },
  {
    selector: "#historical-predictions-section",
    text: "这里会展示历史开奖数据和AI的预测对比。",
  },
];

export default function Home() {
  const {
    hasCompletedOnboarding,
    markOnboardingCompleted,
    markOnboardingSkipped,
  } = useOnboardingCache();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // 确保只在客户端执行
    // 注意：现在 hasCompletedOnboarding 是一个布尔值，而不是一个函数
    if (!hasCompletedOnboarding) {
      setIsGuideOpen(true);
    }
  }, [hasCompletedOnboarding]);

  const handleComplete = () => {
    markOnboardingCompleted();
    setIsGuideOpen(false);
  };

  const handleSkip = () => {
    markOnboardingSkipped(); // 或者 markOnboardingCompleted()，取决于具体逻辑
    setIsGuideOpen(false);
  };

  if (!isClient) {
    // 在服务器端或客户端首次渲染时尚未确定 localStorage 状态时，可以渲染 null 或加载指示器
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <OnboardingGuide
        steps={steps}
        isOpen={isGuideOpen}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
      <header className="mb-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center mb-2">
          <CrownIcon className="w-8 h-8 mr-2 text-gold-400" />
          <h1 className="text-4xl md:text-5xl font-bold gold-text">
            大乐透AI量化分析系统
          </h1>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-700 mx-auto my-4"></div>
        <p className="mt-3 text-gray-300 max-w-2xl mx-auto px-4 text-sm md:text-base">
          上传您购买的随机大乐透号码，AI系统将在开奖前3小时给出量化分析结果
        </p>
      </header>

      <main className="container mx-auto space-y-8 md:space-y-12">
        <DrawInfo />
        <div id="lottery-form-section">
          <LotteryForm />
        </div>
        <div id="ai-results-section">
          <AIResults />
        </div>
        <div id="historical-predictions-section">
          <HistoricalPredictions />
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-400 text-sm pb-8">
        <p>
          © {new Date().getFullYear()} 大乐透AI量化分析系统 -
          提供大乐透数据分析服务
        </p>
        <p className="mt-1 text-xs text-gray-500">仅供参考，请理性购彩</p>
      </footer>
    </div>
  );
}
