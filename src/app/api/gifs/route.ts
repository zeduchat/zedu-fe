import { readdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const GIF_EXTENSIONS = new Set([".gif", ".webp", ".mp4"]);

function titleFromFilename(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  try {
    const gifsDir = path.join(process.cwd(), "public", "gifs");
    const entries = await readdir(gifsDir, { withFileTypes: true });

    const gifs = entries
      .filter((entry) => entry.isFile())
      .filter((entry) =>
        GIF_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
      )
      .map((entry) => {
        const name = titleFromFilename(entry.name);
        return {
          id: entry.name,
          name: name || entry.name,
          category: "all",
          tags: name.toLowerCase().split(/\s+/).filter(Boolean),
          src: `/gifs/${encodeURIComponent(entry.name)}`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ gifs });
  } catch (error) {
    console.error("[gifs] Failed to list local GIFs", error);
    return NextResponse.json({ gifs: [] }, { status: 200 });
  }
}
