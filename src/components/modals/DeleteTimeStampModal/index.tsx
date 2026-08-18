"use client";
import { ReloadIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";

interface DeleteTimeStampModalProps {
  setDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DeleteTimeStampModal = ({
  setDeleteModal,
  setSuccessModal,
}: DeleteTimeStampModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteTimeStamp = () => {
    setLoading(true);
    setTimeout(() => {
      setDeleteModal(false);
      setSuccessModal(true);
    }, 1000);
  };

  return (
    <div className="w-full h-full fixed top-0 right-0 flex items-center justify-center z-50">
      <div
        onClick={() => setDeleteModal(false)}
        className="w-full h-full absolute bg-black opacity-20"
      ></div>
      <div className="bg-white w-[382px] min-h-48 lg:w-[505px] p-6 z-10 rounded-xl flex items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center gap-8">
          <div>
            <h1 className="text-[#0F172A] lg:text-xl text-lg font-semibold leading-normal">
              Delete Slow Build?
            </h1>
            <p className="text-sm leading-7 text-[#475569] mt-2 mb-4">
              Are you sure you want to delete slow build?, It will be
              permanently removed. This action cannot be undone.
            </p>
          </div>
          <div className="w-full flex items-center justify-end gap-6">
            <div onClick={() => setDeleteModal(false)}>
              <button
                className={`px-6 py-3 border border-[#E2E8F0] text-[#475569] bg-white text-sm font-medium rounded-lg hover:scale-90`}
              >
                Cancel
              </button>
            </div>
            <div onClick={handleDeleteTimeStamp}>
              <button
                type="submit"
                className={`px-6 py-3 bg-[#EF4444] text-white text-sm font-medium flex items-center rounded-lg gap-2 ${loading && "opacity-50"} hover:scale-95`}
              >
                {loading ? (
                  <ReloadIcon className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  ""
                )}{" "}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
