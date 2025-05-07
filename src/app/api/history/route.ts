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
    console.error("Error fetching historical predictions:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
