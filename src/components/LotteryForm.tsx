"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Textarea } from "@nextui-org/react";
import { submitLotteryData } from "@/app/actions";
import { LotteryFormSchema, eventBus, parseLotteryNumbers } from "@/lib/utils";
import { LotteryIcon } from "./icons";
import NumberBall from "./icons/NumberBall"; // 导入 NumberBall 组件

type FormData = z.infer<typeof LotteryFormSchema>;

interface ParsedTicket {
  red: string[];
  blue: string[];
  originalLine: string; // 保留原始行以便调试或特定显示
  isValid: boolean;
}

export default function LotteryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [parsedTicketsPreview, setParsedTicketsPreview] = useState<
    ParsedTicket[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    control, // 添加 control 用于 useWatch
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(LotteryFormSchema),
    defaultValues: {
      tickets: "",
    },
  });

  const ticketsValue = useWatch({ control, name: "tickets" });

  const parseSingleTicketString = (ticketString: string): ParsedTicket => {
    const originalLine = ticketString.trim();
    if (!originalLine) {
      return { red: [], blue: [], originalLine, isValid: false };
    }

    // 尝试将 "0102030405+0607" 或 "01 02 03 04 05 + 06 07" 转换为 "01 02 03 04 05 06 07"
    // 直接将原始行传递给 parseLotteryNumbers，它能处理多种格式
    const { redBalls, blueBalls } = parseLotteryNumbers(originalLine);

    const isValid = redBalls.length === 5 && blueBalls.length === 2;

    return {
      red: isValid ? redBalls : [],
      blue: isValid ? blueBalls : [],
      originalLine,
      isValid,
    };
  };

  useEffect(() => {
    if (typeof ticketsValue === "string") {
      const lines = ticketsValue.split("\n");
      const parsed = lines
        .map((line) => parseSingleTicketString(line))
        .filter((p) => p.originalLine !== ""); // 过滤掉完全空行产生的解析结果
      setParsedTicketsPreview(parsed);
    } else {
      setParsedTicketsPreview([]);
    }
  }, [ticketsValue]);

  const onSubmit = async (data: FormData) => {
    setPendingData(data);
    setShowModal(true);
  };

  const submitData = async () => {
    if (!pendingData) return;

    try {
      setIsSubmitting(true);
      setFormMessage(null);
      setShowModal(false);

      const formData = new FormData();
      formData.append("tickets", pendingData.tickets);

      const result = await submitLotteryData(formData);

      if (result.success) {
        setFormMessage({
          type: "success",
          message: result.message,
        });
        reset();

        eventBus.emit("lottery-data-updated");
      } else {
        setFormMessage({
          type: "error",
          message: result.message,
        });
      }
    } catch (error) {
      setFormMessage({
        type: "error",
        message: "提交失败，请稍后再试",
      });
    } finally {
      setIsSubmitting(false);
      setIsAgreed(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5">
        <LotteryIcon className="w-full h-full text-gold-400" />
      </div>

      <h2 className="text-2xl font-bold mb-4 gold-text">提交大乐透号码</h2>

      <div className="mb-6 p-4 bg-dark-900 border-l-4 border-gold-600 text-gray-300 rounded-r">
        <h3 className="font-bold text-gold-300">温馨提示：</h3>
        <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
          <li>请只提交随机购买的真实大乐透号码，不要提交自选号码或虚构数据</li>
          <li>不真实的数据会影响AI的分析结果和准确性</li>
          <li>每个用户每次最多提交5注，每小时最多提交5注</li>
          <li>AI会在开奖前三小时给出20注预测结果，所有用户都能看到</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="tickets"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            输入大乐透号码（每行一注，最多5注）
          </label>
          <Textarea
            id="tickets"
            placeholder="例如：
01 02 03 04 05 + 06 07
11 22 33 04 05 + 08 09"
            className="w-full"
            style={{
              backgroundColor: "#121212",
              color: "#FFD700",
            }}
            classNames={{
              inputWrapper:
                "!bg-dark-900 border-gold-600/30 data-[hover=true]:border-gold-500/70 shadow-none",
              input: "!text-gold-300 placeholder:text-gray-500 !bg-dark-900",
              innerWrapper: "!bg-dark-900",
              base: "!bg-dark-900",
            }}
            minRows={5}
            maxRows={10}
            {...register("tickets")}
            isInvalid={!!errors.tickets}
            errorMessage={errors.tickets?.message}
          />
          {errors.tickets && (
            <p className="mt-1 text-sm text-red-400">
              {errors.tickets.message}
            </p>
          )}
        </div>

        {/* 号码预览区域 */}
        {parsedTicketsPreview.length > 0 && (
          <div className="mt-4 p-3 bg-dark-800 border border-gold-700/30 rounded-md">
            <h4 className="text-md font-semibold text-gold-300 mb-2">
              号码预览:
            </h4>
            {parsedTicketsPreview.map((ticket, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  ticket.isValid ? "bg-dark-900" : "bg-red-900/30"
                }`}
              >
                {ticket.isValid ? (
                  <div className="flex items-center gap-1">
                    {ticket.red.map((num, rIndex) => (
                      <NumberBall
                        key={`preview-red-${index}-${rIndex}`}
                        number={num}
                        color="red"
                      />
                    ))}
                    <span className="mx-1 text-gray-400">+</span>
                    {ticket.blue.map((num, bIndex) => (
                      <NumberBall
                        key={`preview-blue-${index}-${bIndex}`}
                        number={num}
                        color="blue"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">
                    第 {index + 1} 行格式无效: "{ticket.originalLine}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-gold-600 to-gold-800 text-black font-bold py-3 gold-glow"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "提交中..." : "提交号码"}
        </Button>
      </form>

      {formMessage && (
        <div
          className={`mt-4 p-3 rounded ${
            formMessage.type === "success"
              ? "bg-green-900/50 text-green-300 border border-green-700"
              : "bg-red-900/50 text-red-300 border border-red-700"
          }`}
        >
          {formMessage.message}
        </div>
      )}

      <div className="mt-6 p-4 bg-dark-900 border-l-4 border-gold-600 text-gray-300 rounded-r">
        <h3 className="font-bold text-gold-300">号码格式说明：</h3>
        <p className="text-sm mt-2">
          大乐透由前区5个号码（01-35）和后区2个号码（01-12）组成，格式示例：01
          02 03 04 05 + 06 07
        </p>
        <p className="text-sm mt-2">也可以输入无空格格式：0102030405+0607</p>
      </div>

      {/* 确认提交弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="relative bg-dark-800 text-gray-200 border border-gold-500/30 p-6 rounded-lg max-w-lg w-full">
            <div className="border-b border-gold-500/20 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gold-400">温馨提示</h3>
            </div>

            <div className="space-y-4 mb-6">
              <p className="font-bold text-gold-300">请确认您了解以下规则：</p>
              <ul className="list-disc ml-5 text-sm space-y-2">
                <li>
                  请只提交随机购买的真实大乐透号码，不要提交自选号码或虚构数据
                </li>
                <li>不真实的数据会影响AI的分析结果和准确性</li>
                <li>每个用户每次最多提交5注，每小时最多提交5注</li>
                <li>AI会在开奖前三小时给出20注预测结果，所有用户都能看到</li>
              </ul>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="w-4 h-4 text-gold-600 bg-dark-900 border-gold-500 rounded focus:ring-gold-500"
                />
                <label htmlFor="agreement" className="ml-2 text-gold-300">
                  我知道了
                </label>
              </div>
            </div>

            <div className="border-t border-gold-500/20 pt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsAgreed(false);
                }}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded"
              >
                取消
              </button>
              <button
                onClick={submitData}
                disabled={!isAgreed}
                className={`px-4 py-2 rounded font-bold ${
                  isAgreed
                    ? "bg-gradient-to-r from-gold-600 to-gold-800 text-black gold-glow"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
