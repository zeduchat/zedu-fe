"use client";
import React, { useEffect, useState } from "react";
import { showError, showSuccess } from "~/components/toast/sonner";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { PostRequest } from "~/utils/request";

interface ComponentProps {
  closeModal: () => void;
}

export const CreateSystemAgentModal = (props: ComponentProps) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const s_token = localStorage.getItem("admintoken") || "";
    setToken(s_token);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url) {
      showError("You must provide a valid JSON URL!!");
      return;
    }

    setLoading(true);

    const payload = {
      json_url: url,
    };

    const response = await PostRequest(
      `/backoffice/agents/system`,
      payload,
      token
    );

    if (response?.status === 200 || response?.status === 201) {
      props.closeModal();
      showSuccess("Agent created successfully");
    }

    setLoading(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <div className="w-screen h-screen fixed top-0 right-0 flex items-center justify-center">
      <div
        onClick={() => props.closeModal()}
        className="w-full h-full absolute bg-black opacity-20"
      ></div>
      <div className="bg-white w-[400px] lg:w-[600px] flex flex-col rounded-xl  z-10 gap-8">
        <div className="border-b border-gray-200 p-6 pb-4">
          <h1 className="text-[#1D2939] lg:text-xl text-lg font-semibold leading-normal">
            Create System Agent
          </h1>

          <div className="flex gap-4 mt-4">
            <button
              className={`text-sm font-medium border-b-2 border-[#4A90E2] text-[#4A90E2] pb-2 `}
            >
              JSON URL
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full px-5">
          <div className="flex flex-col gap-[16px]">
            <div className="w-full flex flex-col gap-[8px] relative">
              <label
                htmlFor="url"
                className="text-[14px] font-[400] leading-[21px]"
              >
                JSON URL
              </label>
              <div className="w-full flex flex-col gap-[2px]">
                <input
                  value={url}
                  onChange={handleUrlChange}
                  id="url"
                  type="url"
                  placeholder="Enter agent json url"
                  className={`w-full text-[12px] text-[#667085] leading-[15.12px] font-[500] h-[48px] border border-[#D0D0FD]
                                        outline-none rounded-md py-[13px] pl-[13px]`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[24px] mt-5 mb-10 pb-5">
            <div className="flex flex-col gap-[16px]">
              <Button
                type="submit"
                variant="default"
                className="py-6 bg-[#7141F8] hover:bg-[#8760f8] text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-x-2">
                    <span className="animate-pulse">Processing...</span>{" "}
                    <Loading width="20" height="40" />
                  </span>
                ) : (
                  <span>Create an Agent</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
