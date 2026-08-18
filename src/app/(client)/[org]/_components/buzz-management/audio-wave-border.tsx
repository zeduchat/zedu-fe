"use client";

import React from "react";
interface AudioWaveBorderProps {
  isSpeaking: boolean;
  volume: number;
  size?: number | string;
  children: React.ReactNode;
  color?: string;
}
export function AudioWaveBorder({
  isSpeaking,
  volume,
  size = 160,
  children,
  color,
}: AudioWaveBorderProps) {
  const scale = isSpeaking ? 1 + volume * 0.5 : 1;
  const opacity = isSpeaking ? 0.6 + volume * 0.4 : 0;
  const darker = `color-mix(in srgb, ${color} 50%, black)`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {isSpeaking && (
        <>
          <div
            className={`absolute inset-0 rounded-full border-[20px] animate-ping`}
            style={{
              opacity: opacity * 0.6,
              animationDuration: "1.5s",
              borderColor: darker,
            }}
          />
          <div
            className={`absolute inset-0 rounded-full border-[20px] `}
            style={{
              transform: `scale(${scale * 1.1})`,
              opacity: opacity * 0.8,
              borderColor: darker,
              transition: "all 0.1s ease-out",
            }}
          />
        </>
      )}

      <div className="relative flex justify-center items-center rounded-full z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

interface AudioWaveBarsProps {
  isSpeaking: boolean;
  volume: number;
  barCount?: number;
  color?: string;
}

export function AudioWaveBars({
  isSpeaking,
  volume,
  barCount = 3,
  color = "white",
}: AudioWaveBarsProps) {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(0.1));

  useEffect(() => {
    if (!isSpeaking) {
      setHeights(Array(barCount).fill(0.1));
      return;
    }

    const interval = setInterval(() => {
      const newHeights = Array(barCount)
        .fill(0)
        .map(() => {
          const baseHeight = 0.2 + volume * 0.8;
          const randomness = Math.random() * 0.15;
          return Math.min(baseHeight + randomness, 1);
        });
      setHeights(newHeights);
    }, 80);

    return () => clearInterval(interval);
  }, [isSpeaking, volume, barCount]);

  return (
    <div className="flex items-center justify-center gap-0.5">
      {heights.map((height, index) => (
        <div
          key={index}
          className="rounded-full transition-all duration-75"
          style={{
            width: "3px",
            height: `${height * 16}px`,
            backgroundColor: color,
            opacity: isSpeaking ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  );
}
