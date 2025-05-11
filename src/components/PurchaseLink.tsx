"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PurchaseLink() {
  const [purchaseLink, setPurchaseLink] = useState(
    "https://example.com/purchase"
  );
  const [keyPrice, setKeyPrice] = useState("29.9");

  useEffect(() => {
    // 加载购买链接和价格
    const fetchPurchaseInfo = async () => {
      try {
        // 获取购买链接
        const response = await fetch("/api/purchase-link");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.link) {
            setPurchaseLink(data.link);
          }
          // 如果API返回了价格，则使用API的价格
          if (data.success && data.price) {
            setKeyPrice(data.price);
          }
        }
      } catch (error) {
        console.error("获取购买链接失败:", error);
      }
    };

    fetchPurchaseInfo();
  }, []);

  return (
    <div className="mt-4 text-center">
      <div className="inline-flex items-center justify-center bg-gradient-to-r from-gray-900 to-black border border-gold-400 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <Link
          href={purchaseLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-300 font-medium flex items-center"
        >
          <span className="mr-2">🔑</span>
          <span>本期密钥可在官方指定渠道获取 (¥{keyPrice})</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 text-gold-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
