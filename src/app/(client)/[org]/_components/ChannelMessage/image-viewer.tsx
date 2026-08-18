"use client";

import { MinusIcon, PlusIcon, RefreshCwIcon, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import images from "~/assets/images";

const IMAGE_VIEWER_Z_INDEX = 99999;

const ImageViewer = ({ onClose, item, image }: any) => {
  const [mounted, setMounted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Constants for zoom steps and limits
  const ZOOM_STEP = 0.25;
  const MAX_ZOOM = 3;
  const MIN_ZOOM = 0.5;

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Function to handle zooming in
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  // Function to handle zooming out
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const zoomProgress = ((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 flex flex-col justify-between p-4"
      style={{ zIndex: IMAGE_VIEWER_Z_INDEX }}
    >
      <div className="relative flex justify-between items-start text-white">
        <div className="flex items-center gap-3">
          <Image
            src={image?.file_link || images?.user}
            width={80}
            height={80}
            alt="Image thumbnail"
            unoptimized
            className="h-10 w-10 rounded border object-cover"
          />

          <div className="overflow-hidden">
            <p className="font-medium">{item?.username}</p>
            <p className="flex flex-wrap text-sm text-gray-300">
              {moment(item.created_at).startOf("minute").fromNow()} in #
              {item?.channel_name} – {image?.file_name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute right-5 sm:top-5 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
      </div>

      {/* Center image */}
      <div className="flex-grow flex items-center justify-center overflow-hidden">
        <img
          src={image?.file_link}
          alt={image?.file_name || "full image"}
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transition: "transform 0.1s ease-out", // Smooth transition for visual effect
          }}
          className="max-h-[90vh] max-w-full object-contain"
        />
      </div>

      <div className="flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2 py-1 border rounded hover:bg-white/10"
            title="Reset Zoom & Rotation"
          >
            <RefreshCwIcon size={18} />
          </button>

          <button
            onClick={handleZoomOut}
            className="px-2 py-1 border rounded hover:bg-white/10"
            title="Zoom Out"
          >
            <MinusIcon size={18} />
          </button>

          <div className="w-24 h-1 bg-gray-600 rounded-full relative overflow-hidden">
            <div
              className="absolute h-full bg-white rounded-full"
              style={{
                width: `${zoomProgress}%`,
                left: "0%",
              }}
            ></div>
          </div>

          <button
            onClick={handleZoomIn}
            className="px-2 py-1 border rounded hover:bg-white/10"
            title="Zoom In"
          >
            <PlusIcon size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageViewer;
