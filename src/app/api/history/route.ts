import { NextResponse } from "next/server";
import {
  getHistoricalPredictions,
  HistoricalPrediction,
} from "@/app/server/data";

export async function GET() {
  try {
    const history: HistoricalPrediction[] = await getHistoricalPredictions();
    return NextResponse.json(history);
  } catch (error) {
    console.error("获取历史预测数据时出错:", error);
    return NextResponse.json({ message: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const response = await fetch(
      "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=30&isVerify=1&pageNo=1",
      {
        method: "GET", // 虽然是 POST 路由，但第三方 API 是 GET
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 15; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "sec-ch-ua": `"Not/A)Brand";v="8", "Chromium";v="126", "Android WebView";v="126"`,
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": `"Android"`,
          origin: "https://static.sporttery.cn",
          "x-requested-with": "mark.via",
          "sec-fetch-site": "same-site",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          referer: "https://static.sporttery.cn/",
          "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          priority: "u=1, i",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "调用第三方 API 失败:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { message: `调用第三方 API 失败: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data && data.value && data.value.list) {
      const simplifiedData = data.value.list.map((item: any) => ({
        lotteryDrawNum: item.lotteryDrawNum,
        lotteryDrawResult: item.lotteryDrawResult,
        lotteryDrawTime: item.lotteryDrawTime.split(" ")[0], // 只取日期部分
      }));
      return NextResponse.json({ success: true, data: simplifiedData });
    } else {
      console.error("第三方 API 响应格式不正确:", data);
      return NextResponse.json(
        { message: "第三方 API 响应格式不正确" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("处理历史数据请求时出错:", error);
    return NextResponse.json({ message: "服务器内部错误" }, { status: 500 });
  }
}
