import { NextResponse } from "next/server";

/** @deprecated Use `searchMessages` from `~/lib/search/api` (backend direct). */
export async function GET() {
  return NextResponse.json(
    { error: "This route was removed. Search uses the backend API directly." },
    { status: 410 }
  );
}
