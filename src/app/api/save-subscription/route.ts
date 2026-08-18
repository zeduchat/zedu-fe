import { NextRequest, NextResponse } from "next/server";

let subscriptions: any[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  subscriptions.push(body);
  return NextResponse.json({ success: true });
}
