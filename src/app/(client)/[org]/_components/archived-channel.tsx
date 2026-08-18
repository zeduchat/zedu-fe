import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PutRequest } from "~/utils/new-request";

const ArchivedChannel = () => {
  const { state, dispatch } = useContext(DataContext);
  const [buttonLoading, setButtonLoading] = useState(false);
  const params = useParams();
  const id = params.id as string;

  // join channels
  const handleUnarchive = async () => {
    const payload = {
      archived: state?.channelDetails?.archived === true ? false : true,
    };

    setButtonLoading(true);
    const res = await PutRequest(`/channels/${id}/archive`, payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
    }

    setButtonLoading(false);
  };

  //

  return (
    <div className="h-[170px] bg-neutral-100 border-t flex flex-col items-center justify-center ">
      <h1 className="mb-2 text-xl font-semibold">
        # {state?.channelDetails?.name}
      </h1>
      <p className="text-base mb-3">
        You are viewing #{state?.channelDetails?.name} in an archived channel
      </p>
      <Button onClick={handleUnarchive} className="bg-blue-500 text-white px-5">
        {buttonLoading ? (
          <span className="flex items-center gap-x-2">
            <span className="animate-pulse">Loading...</span>{" "}
            <Loading width="20" height="40" />
          </span>
        ) : (
          <span>Unarchive channel</span>
        )}
      </Button>
    </div>
  );
};

export default ArchivedChannel;
