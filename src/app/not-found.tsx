import React from "react";
import Image from "next/image";

function notFound() {
  return (
    <div className="flex overflow-x-hidden">
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
            Something went wrong
          </p>
          <p className="text-sm font-normal leading-5 mt-3 text-slate-600">
            Please restart application
          </p>
        </div>
      </div>
    </div>
  );
}

export default notFound;
