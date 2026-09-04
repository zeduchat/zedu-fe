import React from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find the longest prefix of the search query that appears in the text.
 *
 * For multi-word queries like "Booking ID HN585":
 * - Match "Booking ID HN58" inside "Booking ID HN582384S"
 * - Do NOT match short fragments like "Book" or "booking"
 *   (those lack the multi-word structure of the query)
 */
export function findLongestMatchingQueryPrefix(
  text: string,
  query: string
): string | null {
  const phrase = query.trim();
  if (!phrase || !text) return null;

  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  const isMultiWord = /\s/.test(phrase);

  if (lowerText.includes(lowerPhrase)) {
    return phrase;
  }

  for (let len = lowerPhrase.length - 1; len >= 3; len--) {
    let candidate = lowerPhrase.slice(0, len).replace(/\s+$/, "");
    if (candidate.length < 3) continue;

    // Multi-word searches must match a multi-word phrase.
    // Prevents "Book" matching inside "Bookly" or "booking" in a channel name.
    if (isMultiWord && !/\s/.test(candidate)) continue;

    if (lowerText.includes(candidate)) {
      return phrase.slice(0, candidate.length);
    }
  }

  return null;
}

/**
 * Highlight every occurrence of the best matching query phrase in the text.
 */
export function highlightSearchMatches(
  text: string,
  query: string
): React.ReactNode {
  if (!text) return text;

  const matchPhrase = findLongestMatchingQueryPrefix(text, query);
  if (!matchPhrase) return text;

  const regex = new RegExp(`(${escapeRegExp(matchPhrase)})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  const matchLower = matchPhrase.toLowerCase();

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.toLowerCase() === matchLower) {
      return (
        <mark
          key={`${index}-${part}`}
          className="rounded-[2px] bg-primary-100 px-0.5 text-primary-500 dark:bg-[#2D2463] dark:text-[#C4B5FD]"
        >
          {part}
        </mark>
      );
    }

    return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>;
  });
}

type HighlightedTextProps = {
  text: string;
  query?: string;
  className?: string;
};

export function HighlightedText({
  text,
  query,
  className,
}: HighlightedTextProps) {
  return (
    <span className={className}>
      {highlightSearchMatches(text, query || "")}
    </span>
  );
}
