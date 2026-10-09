function getNonEmptyTextLines(editorText: string): string[] {
  return editorText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function paragraphHasMeaningfulContent(p: Element): boolean {
  if (p.textContent?.trim()) return true;
  return !!p.querySelector("img, a, span.mention, [data-type]");
}

/**
 * TipTap/ProseMirror may keep `<br>`, empty `<p>`, or extra blocks after line breaks
 * are removed. When all non-empty text fits on one line, flatten HTML to match.
 */
export function normalizeOutgoingMessageHtml(
  html: string,
  editorText: string
): string {
  const contentLines = getNonEmptyTextLines(editorText);
  if (contentLines.length > 1) {
    return html;
  }

  let normalized = html
    .replace(/<br[^>]*\/?>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "");

  if (typeof document === "undefined") {
    return normalized;
  }

  const root = document.createElement("div");
  root.innerHTML = normalized;

  if (
    root.querySelector(
      "ul, ol, pre, blockquote, [data-type='codeBlock'], .slack-code-block"
    )
  ) {
    return html;
  }

  root.querySelectorAll("br").forEach((br) => br.remove());

  const paragraphs = Array.from(root.querySelectorAll("p"));
  paragraphs.forEach((p) => {
    if (!paragraphHasMeaningfulContent(p)) {
      p.remove();
    }
  });

  const remainingParagraphs = Array.from(root.querySelectorAll("p"));
  if (remainingParagraphs.length > 1) {
    const combined = remainingParagraphs
      .map((p) => p.innerHTML.trim())
      .filter(Boolean)
      .join(" ");
    root.innerHTML = combined ? `<p>${combined}</p>` : root.innerHTML;
  }

  normalized = root.innerHTML.trim();
  return normalized || html;
}
