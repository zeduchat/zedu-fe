import { NextRequest, NextResponse } from "next/server";
import {
  isAllowedMediaFileUrl,
  officeEmbedUrl,
  resolveMediaFileUrl,
} from "~/lib/env-urls";

const buildPdfViewerUrl = (fileUrl: string) =>
  `${fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0`;

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing file url" }, { status: 400 });
  }

  const fileUrl = resolveMediaFileUrl(rawUrl);

  if (!fileUrl || !isAllowedMediaFileUrl(fileUrl)) {
    return NextResponse.json({ error: "Invalid file url" }, { status: 400 });
  }

  const officePreview = officeEmbedUrl(fileUrl);
  if (officePreview) {
    return NextResponse.redirect(officePreview);
  }

  if (/\.pdf(?:$|[?#])/i.test(fileUrl)) {
    return NextResponse.redirect(buildPdfViewerUrl(fileUrl));
  }

  return new NextResponse(
    `<html><body style="margin:0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#475467"><p>Document preview is not configured.</p></body></html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
