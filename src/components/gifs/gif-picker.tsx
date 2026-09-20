"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  fetchLocalGifs,
  filterLocalGifs,
  type LocalGif,
} from "~/lib/gifs/local-pack";
import { cn } from "~/lib/utils";

type GifPickerProps = {
  onSelect: (gif: LocalGif) => void | Promise<void>;
  sending?: boolean;
};

export default function GifPicker({
  onSelect,
  sending = false,
}: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [gifs, setGifs] = useState<LocalGif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const items = await fetchLocalGifs();
        if (!cancelled) setGifs(items);
      } catch {
        if (!cancelled) setGifs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => filterLocalGifs(gifs, query), [gifs, query]);

  const handleSelect = async (gif: LocalGif) => {
    if (sending || pendingId) return;
    setPendingId(gif.id);
    try {
      await onSelect(gif);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg">
      <div className="border-b border-border bg-popover px-4 pb-3 pt-4">
        <div className="mb-3">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
            GIFs
          </h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {loading
              ? "Loading..."
              : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            autoFocus
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="max-h-[360px] min-h-[260px] overflow-y-auto bg-background p-3">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-1.5 px-6 text-center">
            <p className="text-[14px] font-medium text-foreground">
              {gifs.length === 0 ? "No GIFs yet" : "No GIFs found"}
            </p>
            <p className="text-[12px] leading-5 text-muted-foreground">
              {gifs.length === 0
                ? "Drop .gif files into public/gifs and reopen this picker."
                : "Try another keyword"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((gif) => {
              const isPending = pendingId === gif.id;
              return (
                <button
                  key={gif.id}
                  type="button"
                  title={gif.name}
                  disabled={sending || Boolean(pendingId)}
                  onClick={() => handleSelect(gif)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
                    isPending && "border-primary ring-2 ring-primary/20"
                  )}
                >
                  <div className="relative aspect-square bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gif.src}
                      alt={gif.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                    {isPending && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-black/50">
                        <Loader2
                          size={18}
                          className="animate-spin text-white"
                        />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
