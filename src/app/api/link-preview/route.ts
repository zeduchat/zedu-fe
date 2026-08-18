import { NextRequest, NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const { result } = await ogs({ url });

    return NextResponse.json({
      title: result.ogTitle || result.twitterTitle || "No Title",
      description: result.ogDescription || result.twitterDescription || "",
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || "",
      siteName: result.ogSiteName || new URL(url).hostname,
      url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 400 }
    );
  }
}
