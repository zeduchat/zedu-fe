"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest, PostRequest } from "~/utils/new-request";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Loading from "~/components/ui/loading";
import { useRouter } from "next/navigation";
import AllColleaguesHeader from "../../_components/colleagues/all-colleagues-nav";
import ActiveColleagues from "../../_components/colleagues/active-colleagues";
import InActiveColleagues from "../../_components/colleagues/inactive-colleagues";
import { showSuccess } from "~/components/toast/sonner";

const AllColleagues = () => {
  const { state, dispatch } = useContext(DataContext);
  const [activeTopTab, setActiveTopTab] = useState(state?.topLabel);
  const [url, setUrl] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const { agentModal, orgSlug } = state;
  const [callback, setCallback] = useState(false);
  const router = useRouter();

  const getColleagues = useCallback(async () => {
    const orgId = localStorage.getItem("orgId") || "";

    const res = await GetRequest(`/organisations/${orgId}/agents?limit=1000`);

    const active = res?.data?.data?.filter(
      (item: any) => item?.is_active === true
    );
    const inactive = res?.data?.data?.filter(
      (item: any) => item?.is_active === false
    );

    if (res?.status === 200 || res?.status === 201) {
      dispatch({ type: ACTIONS.ACTIVE_AGENTS, payload: active });
      dispatch({ type: ACTIONS.INACTIVE_AGENTS, payload: inactive });
    }
    dispatch({ type: ACTIONS.INTEGRATIONS_LOADING, payload: false });
  }, [dispatch]);

  useEffect(() => {
    getColleagues();
  }, [getColleagues]);

  // Fetch Agents
  useEffect(() => {
    const getAgents = async () => {
      const res = await GetRequest("/agents");
      if (res?.status === 200 || res?.status == 201) {
        dispatch({
          type: ACTIONS.MARKETPLACE_AGENTS,
          payload: res?.data?.data,
        });
      }
    };
    getAgents();
  }, [dispatch]);

  const handleRoute = (label: string) => {
    dispatch({ type: ACTIONS.TOP_LABEL, payload: label });
    setActiveTopTab(label);
  };

  // Handle save agent
  const handleSave = async (e: any) => {
    e.preventDefault();

    const orgId = localStorage.getItem("orgId") || "";
    setCreateLoading(true);

    const payload = {
      json_url: url,
    };

    const res = await PostRequest(`/organisations/${orgId}/agents`, payload);
    if (res?.status === 200 || res?.status === 201) {
      setCallback(!callback);
      dispatch({
        type: ACTIONS.AGENT_CALLBACK,
        payload: !state?.agentCallback,
      });
      showSuccess(res?.data?.message);
      setTimeout(() => {
        dispatch({ type: ACTIONS.AGENT_MODAL, payload: false });
        setUrl("");
        router.push(`/${orgSlug}/colleagues/browse/${res?.data?.data?.id}`);
      }, 1000);
    }
    setCreateLoading(false);
  };

  return (
    <div className="w-full">
      <AllColleaguesHeader />

      <div className="py-3">
        {/* Top Tabs */}
        <div className={`flex items-center text-sm space-x-6 px-4 border-b`}>
          <span
            onClick={() => handleRoute("Active")}
            className={`cursor-pointer flex items-center pb-4 ${
              activeTopTab === "Active"
                ? "text-black font-semibold border-b-2 border-blue-300"
                : "text-gray-500"
            }`}
          >
            Active
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTopTab === "Active"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100"
              }`}
            >
              {state?.activeAgents?.length}
            </span>
          </span>

          <span
            onClick={() => handleRoute("Inactive")}
            className={`cursor-pointer flex items-center pb-4 ${
              activeTopTab === "Inactive"
                ? "text-black font-semibold border-b-2 border-blue-300"
                : "text-gray-500"
            }`}
          >
            Inactive
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTopTab === "Inactive"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100"
              }`}
            >
              {state?.inactiveAgents?.length}
            </span>
          </span>
        </div>

        <div>
          {activeTopTab === "Active" && <ActiveColleagues />}
          {activeTopTab === "Inactive" && <InActiveColleagues />}
        </div>
      </div>

      {/* Add agent modal */}
      <Dialog
        open={agentModal}
        onOpenChange={() =>
          dispatch({ type: ACTIONS.AGENT_MODAL, payload: !agentModal })
        }
      >
        <DialogContent className="rounded-lg">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-blue-500">
              Provide your Agent Json url
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Json url</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter json url"
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                dispatch({ type: ACTIONS.AGENT_MODAL, payload: false })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!url}
              className="bg-blue-500 gap-1 text-white px-8"
            >
              Save
              {createLoading && <Loading />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllColleagues;
