import Image from "next/image";
import React, { useContext } from "react";
import images from "~/assets/images";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";

const ChannelIntro = () => {
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails } = state;
  //

  return (
    <div className=" h-[50vh]">
      <div className="px-5 pt-[50px] lg:pt-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <Image
              src={images.disco}
              alt="logo"
              width={64}
              height={64}
              className="hidden sm:flex"
            />
            <div className="flex flex-col">
              <h1 className="text-lg md:text-[28px] font-bold text-[#1D2939]">
                Welcome to #{channelDetails?.name}
              </h1>
              <p className="text-[15px] text-[#475467]">
                Share all information relating to {channelDetails?.name} here.
                All team members await you! 😉
              </p>

              <div
                onClick={() =>
                  dispatch({ type: ACTIONS.CHANNEL_INVITE, payload: true })
                }
                className="mt-5 border border-[#E6EAEF] px-2 py-3 rounded-[7px] max-w-[344px] flex items-center gap-[10px] cursor-pointer"
              >
                <div>
                  <Image
                    src={images.teammates}
                    alt="teammates"
                    width={32}
                    height={32}
                  />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1D2939] mb-1">
                    Invite teammates
                  </h3>
                  <p className="text-[13px] text-[#475467]">
                    Add your entire team in seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelIntro;
