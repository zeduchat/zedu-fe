import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";

const JoinChannel = () => {
  const { state, dispatch } = useContext(DataContext);
  const [buttonloading, setButtonloading] = useState(false);
  const params = useParams();
  const id = params.id as string;

  // join channels
  const handleJoin = async () => {
    setButtonloading(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const res = await PostRequest(`/channels/${id}/join`, {
      username: user?.username,
    });
    if (res?.status === 200 || res?.status === 200) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
      setButtonloading(false);
    } else {
      setButtonloading(false);
    }
  };

  //

  return (
    <div className="h-[170px] bg-neutral-100 border-t flex flex-col items-center justify-center ">
      <h1 className="mb-2 text-xl font-semibold">
        # {state?.channelDetails?.name}
      </h1>
      <p className="text-base mb-3">You are not a member of this channel</p>
      <Button onClick={handleJoin} className="bg-blue-500 text-white px-5">
        {buttonloading ? (
          <span className="flex items-center gap-x-2">
            <span className="animate-pulse">Joining...</span>{" "}
            <Loading width="20" height="40" />
          </span>
        ) : (
          <span>Join channel</span>
        )}
      </Button>
    </div>
  );
};

export default JoinChannel;
