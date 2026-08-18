"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function NotFound() {
  const router = useRouter();

  const handleRetry = () => {
    const orgSlug = localStorage.getItem("orgSlug");
    const hasValidSlug = orgSlug && orgSlug !== "undefined";

    router.push(hasValidSlug ? `/${orgSlug}` : "/client");
  };

  return (
    <div className="flex ">
      <div className="w-full h-screen flex flex-col">
        <div className="max-w-full mt-24 flex flex-col items-center justify-center">
          <Image
            src="/images/error-img.svg"
            height="100"
            width="400"
            alt="error image"
            className="w-60 h-40"
          />
          <p className="text-xl font-semibold leading-6 mt-5 text-slate-600">
            Network error, Could not validate your organisation.
          </p>
          <p className="text-sm font-normal leading-5 mt-3 text-slate-600">
            Please click the button below to retry again
          </p>
          <button
            onClick={handleRetry}
            className="bg-primary-500 text-white px-8 py-2 mt-5 rounded-md"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
