import { z } from "zod";

// 大乐透数据验证模式
// 大乐透的格式为：前区5个号码（1-35）+ 后区2个号码（1-12）
export const DaLeTouSchema = z.string().refine(
  (val) => {
    // 移除所有空格
    const cleanedVal = val.replace(/\s+/g, "");

    // 检查格式：应该是5个1-35之间的数字，加上2个1-12之间的数字
    const regex = /^(\d{2}){5}\+(\d{2}){2}$/;
    if (!regex.test(cleanedVal)) return false;

    // 分割前区和后区
    const [frontPart, backPart] = cleanedVal.split("+");

    // 检查前区数字是否在1-35范围内且没有重复
    const frontNumbers: number[] = [];
    for (let i = 0; i < 5; i++) {
      const num = parseInt(frontPart.substring(i * 2, i * 2 + 2), 10);
      if (num < 1 || num > 35 || frontNumbers.includes(num)) return false;
      frontNumbers.push(num);
    }

    // 检查后区数字是否在1-12范围内且没有重复
    const backNumbers: number[] = [];
    for (let i = 0; i < 2; i++) {
      const num = parseInt(backPart.substring(i * 2, i * 2 + 2), 10);
      if (num < 1 || num > 12 || backNumbers.includes(num)) return false;
      backNumbers.push(num);
    }

    return true;
  },
  {
    message:
      "大乐透格式错误，应为5个1-35之间的前区号码和2个1-12之间的后区号码，例如：0102030405+0607",
  }
);

// 大乐透表单验证模式
export const LotteryFormSchema = z.object({
  tickets: z.string().refine(
    (val) => {
      // 将输入按换行符分割成多行
      const lines = val
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "");

      // 验证行数不超过5行
      if (lines.length > 5) return false;

      // 验证每一行都是有效的大乐透格式
      return lines.every((line) => {
        try {
          DaLeTouSchema.parse(line);
          return true;
        } catch (error) {
          return false;
        }
      });
    },
    {
      message: "请输入1-5注有效的大乐透号码，每行一注",
    }
  ),
});

// 获取当前期号
export function getCurrentDrawNumber(): string {
  const now = new Date();

  // 获取今天的日期
  const today = now.getDay(); // 0是周日，1是周一，...，6是周六
  const currentHour = now.getHours();

  // 如果今天是开奖日(周一=1, 周三=3, 周六=6)且已经过了开奖时间(21:30)，
  // 期号应该是下一个开奖日
  if (
    (today === 1 || today === 3 || today === 6) &&
    currentHour >= 21 &&
    now.getMinutes() >= 30
  ) {
    // 如果已经过了开奖时间，计算下一个开奖日
    const daysToAdd = today === 1 ? 2 : today === 3 ? 3 : 1;
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysToAdd);
    return formatDateToDrawNumber(nextDate);
  }

  // 如果今天不是开奖日，找到最近的下一个开奖日
  const daysToAdd =
    today === 0
      ? 1 // 周日 -> 周一(+1)
      : today === 1
      ? 0 // 周一 -> 当天(+0)
      : today === 2
      ? 1 // 周二 -> 周三(+1)
      : today === 3
      ? 0 // 周三 -> 当天(+0)
      : today === 4
      ? 2 // 周四 -> 周六(+2)
      : today === 5
      ? 1 // 周五 -> 周六(+1)
      : 0; // 周六 -> 当天(+0)

  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysToAdd);
  return formatDateToDrawNumber(targetDate);
}

// 将日期格式化为期号格式（年份后两位 + 期号，例如：23001）
function formatDateToDrawNumber(date: Date): string {
  const year = date.getFullYear().toString().slice(2); // 取年份后两位

  // 计算这是今年的第几期
  // 简单起见，我们计算这是一年中的第几个周一/周三/周六
  const startOfYear = new Date(date.getFullYear(), 0, 1); // 今年的1月1日
  const dayOfWeek = date.getDay(); // 当前日期是星期几

  let periodCount = 0;
  const currentDay = new Date(startOfYear);

  // 循环直到达到当前日期或超过
  while (currentDay <= date) {
    const weekday = currentDay.getDay();
    if (weekday === 1 || weekday === 3 || weekday === 6) {
      periodCount++;
    }
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // 如果当前日期不是开奖日，减去1
  if (dayOfWeek !== 1 && dayOfWeek !== 3 && dayOfWeek !== 6) {
    periodCount--;
  }

  // 格式化期号，例如 23001
  return `${year}${periodCount.toString().padStart(3, "0")}`;
}

// 格式化日期为YYYY-MM-DD格式
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 格式化数字为两位数，例如：01, 02, ..., 10, 11
export function formatNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

// 将大乐透号码字符串格式化为标准显示格式
export function formatLotteryNumber(value: string): string {
  // 移除所有空格
  const cleanedVal = value.replace(/\s+/g, "");

  // 检查是否包含+号
  if (!cleanedVal.includes("+")) return value;

  // 分割前区和后区
  const [frontPart, backPart] = cleanedVal.split("+");

  // 格式化前区号码
  const frontNumbers: string[] = [];
  for (let i = 0; i < frontPart.length; i += 2) {
    frontNumbers.push(frontPart.substring(i, i + 2));
  }

  // 格式化后区号码
  const backNumbers: string[] = [];
  for (let i = 0; i < backPart.length; i += 2) {
    backNumbers.push(backPart.substring(i, i + 2));
  }

  // 返回格式化后的号码
  return `${frontNumbers.join(" ")} + ${backNumbers.join(" ")}`;
}

// 全局事件总线
export const eventBus = {
  _events: new Map<string, Function[]>(),

  // 订阅事件
  on(event: string, callback: Function) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event)?.push(callback);
  },

  // 取消订阅
  off(event: string, callback: Function) {
    const callbacks = this._events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  },

  // 触发事件
  emit(event: string, data?: any) {
    const callbacks = this._events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  },
};

// 解析开奖号码字符串，返回红球和蓝球数组
export function parseLotteryNumbers(lotteryDrawResult: string): {
  redBalls: string[];
  blueBalls: string[];
} {
  if (!lotteryDrawResult || typeof lotteryDrawResult !== "string") {
    return { redBalls: [], blueBalls: [] };
  }
  // 移除所有非数字和非+号的字符，以兼容 "0102030405+0607" 或 "01 02 03 04 05 + 06 07" 等格式
  const cleanedString = lotteryDrawResult.replace(/[^\d+]/g, "");

  if (cleanedString.includes("+")) {
    const parts = cleanedString.split("+");
    const redPart = parts[0];
    const bluePart = parts[1];
    const redBalls: string[] = [];
    const blueBalls: string[] = [];
    for (let i = 0; i < redPart.length; i += 2) {
      redBalls.push(redPart.substring(i, i + 2));
    }
    for (let i = 0; i < bluePart.length; i += 2) {
      blueBalls.push(bluePart.substring(i, i + 2));
    }
    // 确保红球和蓝球数量正确
    if (redBalls.length === 5 && blueBalls.length === 2) {
      return { redBalls, blueBalls };
    }
  }

  // 如果不是 "+" 分隔的格式，或者解析失败，尝试空格分隔
  const numbers = lotteryDrawResult
    .trim()
    .split(/\s+/)
    .filter((n) => n !== "+"); // 移除可能存在的单独的 '+'
  const redBalls = numbers.slice(0, 5);
  const blueBalls = numbers.slice(5, 7);
  // 再次校验，以防原始逻辑处理的是正确格式但被上面的逻辑错误处理
  if (redBalls.length === 5 && blueBalls.length === 2) {
    return { redBalls, blueBalls };
  }

  // 如果两种方式都无法正确解析，返回空数组
  return { redBalls: [], blueBalls: [] };
  return { redBalls, blueBalls };
}
