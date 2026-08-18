import { useParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";

const UseGetSingleChannel = () => {
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);

  // get persisted data
  useEffect(() => {
    if (id) {
      const fetchChannelById = async () => {
        const res = await GetRequest(`/channels/${id}`);
        if (res?.status === 200 || res?.status === 201) {
          dispatch({
            type: ACTIONS.CHANNEL_DETAILS,
            payload: res?.data?.data,
          });
        }
        dispatch({
          type: ACTIONS.CHANNEL_LOADING,
          payload: false,
        });
      };
      fetchChannelById();
    }
  }, [
    dispatch,
    id,
    state?.channelCallback,
    state?.leaveCallback,
    state?.joinCallback,
  ]);

  return <></>;
};

export default UseGetSingleChannel;
