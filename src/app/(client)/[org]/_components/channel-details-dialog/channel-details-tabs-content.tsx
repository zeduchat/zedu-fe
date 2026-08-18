import { Button } from "~/components/ui/button";
import { UserPlusIcon, RobotIcon } from "~/svgs";
import { EditTopicDialog } from "./edit-topic-dialog";
import { DataContext } from "~/store/GlobalState";
import { useContext, useState } from "react";
import Image from "next/image";
import images from "~/assets/images";
import { PostRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import Loading from "~/components/ui/loading";
import { UnarchiveChannelDialog } from "./unarchive-channel";
import GlobalSearch from "../global-search";
import moment from "moment";

export function AboutTabContainer({ setIsOpen }: any) {
  const [buttonLoading, setButtonLoading] = useState(false);

  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails } = state;

  const handleLeave = async () => {
    setButtonLoading(true);

    const res = await PostRequest(`/channels/${id}/leave`, {});
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
        payload: !state?.channelCallback,
      });
      setIsOpen(false);
    }
    setButtonLoading(false);
  };

  //

  return (
    <div className="bg-white text-[0.9375rem] divide-y divide-[#E6EAEF] border border-[#E6EAEF] rounded-[0.625rem] overflow-hidden">
      <div className="py-4 px-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#101828]">Topic</h3>
          <p className="text-[#667085]">
            {channelDetails?.topic || "Add a topic"}
          </p>
        </div>

        <EditTopicDialog
          type="topic"
          className="text-primary-500 text-[0.8125rem] p-0 h-fit"
        >
          Edit
        </EditTopicDialog>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#101828]">Description</h3>
          <p className="text-[#667085]">
            {channelDetails?.description || "Add a description"}
          </p>
        </div>

        <EditTopicDialog
          type="description"
          className="text-primary-500 text-[0.8125rem] p-0 h-fit"
        >
          Edit
        </EditTopicDialog>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#101828]">Created by</h3>
          <p className="text-[0.9375rem] text-[#667085]">
            {channelDetails?.owner_name} on{" "}
            {moment(channelDetails?.created_at).format("ll")}
          </p>
        </div>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <UnarchiveChannelDialog>
          <Button className="flex items-center gap-2 text-[#D31103] font-bold p-0 h-fit">
            Archive channel for everyone
          </Button>
        </UnarchiveChannelDialog>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <Button
          onClick={handleLeave}
          className="flex items-center text-[#D31103] font-bold p-0 h-fit gap-2"
        >
          Leave channel
          {buttonLoading && <Loading color="red" height="15px" width="15px" />}
        </Button>
      </div>
    </div>
  );
}

export function PeopleTabContainer() {
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails } = state;
  const [filteredData, setFilteredData] = useState(channelDetails?.users);

  return (
    <div>
      {/* SEARCH INPUT */}
      <GlobalSearch
        data={channelDetails?.users}
        placeholder="Find a user"
        onSearchResults={setFilteredData}
      />

      <Button
        onClick={() =>
          dispatch({ type: ACTIONS.CHANNEL_INVITE, payload: true })
        }
        className="h-fit p-0 py-3 gap-2 font-semibold text-[#101828] text-[0.9375rem]"
      >
        <div className="w-8 aspect-square rounded-full bg-[#E6F1FF] flex justify-center items-center">
          <UserPlusIcon />
        </div>
        Add people
      </Button>

      {/* USERS DISPLAYED */}
      <div className="max-h-[300px] overflow-auto">
        {filteredData?.map((item: any) => {
          return (
            <div
              key={item}
              className="flex justify-start items-center gap-2.5 py-3"
            >
              <figure className="relative aspect-square w-[2.25rem] rounded-[0.4375rem]">
                <Image
                  src={item?.profile?.avatar_url || images?.user}
                  alt=""
                  fill
                  className="border rounded"
                />
                <span
                  className={`absolute z-50 -bottom-1 -right-1 inline-block w-[0.625rem] aspect-square border-[1.5px] border-white rounded-full ${
                    item?.profile?.online ? "bg-[#00AD51]" : "bg-[#F97316]"
                  }`}
                ></span>
              </figure>

              <div className="flex items-center gap-2">
                <p className="font-medium text-[#101828] text-[0.9375rem]">
                  @{item?.profile?.username}
                </p>
                <span className="inline-block bg-[#E6EAEF] w-[0.375rem] aspect-square rounded-full"></span>
                <p className="text-[#475467] text-[0.8125rem]">
                  {item?.profile?.username}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AgentsTabContainer() {
  const { state, dispatch } = useContext(DataContext);
  const { channelAgents } = state;
  const [filteredData, setFilteredData] = useState(channelAgents);

  //

  return (
    <div>
      {/* SEARCH INPUT */}
      <GlobalSearch
        data={channelAgents}
        placeholder="Find an agent"
        onSearchResults={setFilteredData}
      />

      <Button
        onClick={() => dispatch({ type: ACTIONS.AGENT_MODAL, payload: true })}
        className="h-fit p-0 py-3 gap-2 font-semibold text-[#101828] text-[0.9375rem]"
      >
        <div className="w-8 aspect-square rounded-full bg-[#F2F4F7] flex justify-center items-center">
          <RobotIcon />
        </div>
        Add agents
      </Button>

      {/* AGENTS DISPLAYED */}
      <div className="max-h-[300px] overflow-auto">
        {filteredData?.map((item: any, index: number) => {
          return (
            <div key={index} className="flex items-center gap-2.5 py-3">
              <div className="size-8 rounded border border-[#E6EAEF] flex items-center justify-center bg-green-100 relative overflow-hidden">
                <Image
                  src={item?.app_logo || images?.bot}
                  alt={item?.app_name}
                  width={20}
                  height={20}
                  className="size-8 rounded"
                />
              </div>

              <p className="font-semibold text-[#101828] text-[0.9375rem]">
                @{item?.app_name}
              </p>
            </div>
          );
        })}

        {filteredData?.length === 0 && (
          <p className="text-center text-gray-500 my-10 text-sm">
            No available agent
          </p>
        )}
      </div>
    </div>
  );
}

export function TabsTabContainer() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 text-center">
      <h2 className="text-lg font-semibold text-gray-800">🚧 Coming Soon</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        This feature is currently under development. Please check back later!
      </p>
    </div>
  );
}
