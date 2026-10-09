"use client";

import { useEffect, useState, type RefObject } from "react";

const CLIPPING_OVERFLOW = new Set([
  "auto",
  "scroll",
  "hidden",
  "clip",
  "overlay",
]);

const visibleClip = (element: HTMLElement) => {
  let top = 0;
  let left = 0;
  let right = window.innerWidth;
  let bottom = window.innerHeight;
  let node = element.parentElement;

  while (node) {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();

    if (
      CLIPPING_OVERFLOW.has(style.overflowY) ||
      CLIPPING_OVERFLOW.has(style.overflow)
    ) {
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }

    if (
      CLIPPING_OVERFLOW.has(style.overflowX) ||
      CLIPPING_OVERFLOW.has(style.overflow)
    ) {
      left = Math.max(left, rect.left);
      right = Math.min(right, rect.right);
    }

    node = node.parentElement;
  }

  return { top, left, right, bottom };
};

const observedElement = (node: HTMLElement | null): HTMLElement | null => {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return node;
  return node.parentElement;
};

const isPaintedInView = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;

  const clip = visibleClip(element);
  const top = Math.max(rect.top, clip.top);
  const bottom = Math.min(rect.bottom, clip.bottom);
  const left = Math.max(rect.left, clip.left);
  const right = Math.min(rect.right, clip.right);

  if (bottom - top < 8 || right - left < 8) return false;

  const x = (left + right) / 2;
  const y = (top + bottom) / 2;
  const hit = document.elementFromPoint(x, y);

  return Boolean(hit && (hit === element || element.contains(hit)));
};

const scrollParents = (element: HTMLElement) => {
  const parents: HTMLElement[] = [];
  let node = element.parentElement;

  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      parents.push(node);
    }
    node = node.parentElement;
  }

  return parents;
};

export const useInChatView = (ref: RefObject<HTMLElement | null>) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const target = observedElement(ref.current);
    if (!target) return;

    let active = true;
    let frame = 0;

    const update = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!active) return;
        const current = observedElement(ref.current);
        setInView(current ? isPaintedInView(current) : false);
      });
    };

    const parents = scrollParents(target);
    const root = parents[0] ?? null;
    const observer = new IntersectionObserver(update, {
      root,
      threshold: 0,
    });
    const resizeObserver = new ResizeObserver(update);

    observer.observe(target);
    resizeObserver.observe(target);
    parents.forEach((parent) => {
      parent.addEventListener("scroll", update, { passive: true });
    });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    update();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      parents.forEach((parent) => {
        parent.removeEventListener("scroll", update);
      });
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [ref]);

  return inView;
};
