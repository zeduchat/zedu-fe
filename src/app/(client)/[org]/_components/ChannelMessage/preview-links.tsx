import React, { useEffect, useRef, useState } from "react";

interface LinkPreview {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
}

interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_link: string;
}

const previewCache = new Map<string, LinkPreview[]>();

const PreviewLinks = ({
  item,
}: {
  item: { id?: string; message: string; media?: MediaItem[] };
}) => {
  const [previews, setPreviews] = useState<LinkPreview[]>([]);
  const prevMessageRef = useRef<string>("");

  // Extract links from text
  const extractLinks = (text: string) => {
    const urlRegex =
      /((?:https?:\/\/|www\.)[^\s<"]+|\b\w+\.(?:com|co|ng|net|org|io|dev|ai|app|cc)\b)/gi;
    return Array.from(
      new Set(
        (text.match(urlRegex) || []).map((url) => {
          let cleanedUrl = url.replace(/['">,.;!]+$/, "");
          if (cleanedUrl.startsWith("www.")) {
            cleanedUrl = `http://${cleanedUrl}`;
          }
          return cleanedUrl;
        })
      )
    );
  };

  useEffect(() => {
    //Only run if this particular message text changed
    if (prevMessageRef.current === item.message) return;
    prevMessageRef.current = item.message;

    const urls = extractLinks(item.message);
    if (urls.length === 0) {
      setPreviews([]);
      return;
    }

    // Check if we already have previews cached for this message
    if (previewCache.has(item.message)) {
      setPreviews(previewCache.get(item.message)!);
      return;
    }

    const fetchPreview = async (url: string) => {
      try {
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`
        );
        if (!response.ok) return null;
        const data: LinkPreview = await response.json();
        return data.title ? data : null;
      } catch {
        return null;
      }
    };

    const loadPreviews = async () => {
      const previewData = await Promise.all(urls.map(fetchPreview));
      const uniquePreviews = Array.from(
        new Map(
          previewData
            .filter((p): p is LinkPreview => Boolean(p))
            .map((p) => [p!.url, p])
        ).values()
      );

      // Cache result for this message text
      previewCache.set(item.message, uniquePreviews);
      setPreviews(uniquePreviews);
    };

    loadPreviews();
  }, []);

  return previews.length > 0 ? (
    <div className="mt-2">
      {previews.map((preview, index) => (
        <a
          key={index}
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border w-full md:w-[500px] rounded-md p-3 mb-2 hover:bg-gray-100 transition"
        >
          <div className="mb-2">
            <div className="text-sm font-semibold text-gray-800">
              {preview.siteName}
            </div>
            <div className="text-blue-600 font-medium">{preview.title}</div>
            <div className="text-gray-600 text-sm">{preview.description}</div>
          </div>

          {preview.image && (
            <img
              src={preview.image}
              alt={preview.title}
              className="w-80 h-40 object-cover rounded-md mt-2"
            />
          )}
        </a>
      ))}
    </div>
  ) : null;
};

export default PreviewLinks;
