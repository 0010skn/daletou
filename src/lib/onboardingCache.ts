// src/lib/onboardingCache.ts
import { useState, useEffect, useCallback } from "react";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

/**
 * 检查 localStorage 是否可用。
 * @returns {boolean} 如果 localStorage 可用则返回 true，否则返回 false。
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = "__test_local_storage__";
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * 自定义 React Hook 用于管理新人引导的缓存状态。
 */
export const useOnboardingCache = () => {
  const [hasCompleted, setHasCompleted] = useState<boolean>(() => {
    if (!isLocalStorageAvailable()) {
      return true; // localStorage 不可用时，默认用户已完成
    }
    try {
      const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return completed === "true";
    } catch (error) {
      console.error(
        "Error reading onboarding status from localStorage on init:",
        error
      );
      return true; // 出错时，也默认用户已完成
    }
  });

  // 用于在 localStorage 变化时更新状态 (例如在另一个标签页中更改)
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ONBOARDING_COMPLETED_KEY) {
        try {
          setHasCompleted(event.newValue === "true");
        } catch (error) {
          console.error(
            "Error updating onboarding status from storage event:",
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const markOnboardingCompleted = useCallback((): void => {
    if (!isLocalStorageAvailable()) {
      console.warn(
        "localStorage is not available. Onboarding completion status cannot be saved."
      );
      return;
    }
    try {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      setHasCompleted(true);
    } catch (error) {
      console.error(
        "Error marking onboarding as completed in localStorage:",
        error
      );
    }
  }, []);

  const markOnboardingSkipped = useCallback((): void => {
    if (!isLocalStorageAvailable()) {
      console.warn(
        "localStorage is not available. Onboarding skipped status cannot be saved."
      );
      return;
    }
    try {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true"); // 跳过也视为完成
      setHasCompleted(true);
    } catch (error) {
      console.error(
        "Error marking onboarding as skipped in localStorage:",
        error
      );
    }
  }, []);

  return {
    hasCompletedOnboarding: hasCompleted, // 重命名以保持外部API一致性，但现在是状态值
    markOnboardingCompleted,
    markOnboardingSkipped,
  };
};
