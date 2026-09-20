export type LocalGif = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  /** Public URL under /gifs */
  src: string;
};

export function filterLocalGifs(gifs: LocalGif[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return gifs;

  return gifs.filter((gif) => {
    const haystack = [gif.name, gif.id, ...gif.tags].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

/** Fetch a local GIF and wrap it as an uploadable File. */
export async function localGifToFile(gif: LocalGif): Promise<File> {
  const response = await fetch(gif.src);
  if (!response.ok) {
    throw new Error(`Failed to load GIF: ${gif.name}`);
  }

  const blob = await response.blob();
  const type = blob.type || "image/gif";
  const extension = type.includes("webp")
    ? "webp"
    : type.includes("mp4")
      ? "mp4"
      : "gif";

  return new File([blob], `gif-${gif.id}.${extension}`, { type });
}

export async function fetchLocalGifs(): Promise<LocalGif[]> {
  const response = await fetch("/api/gifs");
  if (!response.ok) return [];

  const json = (await response.json()) as { gifs?: LocalGif[] };
  return Array.isArray(json.gifs) ? json.gifs : [];
}
