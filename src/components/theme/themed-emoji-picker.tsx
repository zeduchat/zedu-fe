"use client";

import EmojiPicker from "@emoji-mart/react";
import { useTheme } from "next-themes";

export default function ThemedEmojiPicker(props: any) {
  const { resolvedTheme } = useTheme();

  return (
    <EmojiPicker
      {...props}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
