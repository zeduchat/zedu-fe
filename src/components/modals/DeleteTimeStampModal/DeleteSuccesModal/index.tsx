"use client";
import React from "react";
import { Check } from "lucide-react";

interface SuccessModalProps {
  setSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DeleteSuccessModal = ({ setSuccessModal }: SuccessModalProps) => {
  return (
    <div className="w-full h-full fixed top-0 right-0 flex items-center justify-center z-50">
      <div
        onClick={() => setSuccessModal(false)}
        className="w-full h-full absolute bg-black opacity-20"
      ></div>
      <div className="bg-white w-[382px] min-h-48 lg:w-[505px] p-6 z-10 rounded-xl flex flex-col items-center justify-center gap-4 relative">
        <button
          onClick={() => setSuccessModal(false)}
          className="absolute top-1 right-3 text-[#1D2939] hover:text-black font-medium text-4xl"
        >
          &times;
        </button>
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500 mt-4">
          <Check className="text-white" size={30} />
        </div>
        <h1 className="text-[#0F172A] lg:text-xl text-lg font-bold leading-normal">
          Success
        </h1>
        <p className="text-sm leading-7 text-[#475569]">
          Slow build has been deleted.
        </p>
      </div>
    </div>
  );
};
