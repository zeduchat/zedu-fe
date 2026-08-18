"use client";

import { Search } from "lucide-react";
import PageHeader from "../components/page-header";
import { useContext, useEffect, useState, useCallback } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";
import ActiveAgents from "../../_components/agents/active-agents";
import InActiveAgents from "../../_components/agents/inactive-agents";
import AgentsMarketplace from "../../_components/agents/agent-marketplace";

const BrowseAgents = () => {
  const { state, dispatch } = useContext(DataContext);
  const [activeTopTab, setActiveTopTab] = useState(state?.topLabel);

  const getIntegrations = useCallback(async () => {
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
    getIntegrations();
  }, [getIntegrations]);

  // Fetch Integrations
  useEffect(() => {
    const getIntegrations = async () => {
      const res = await GetRequest("/agents");
      if (res?.status === 200 || res?.status == 201) {
        dispatch({
          type: ACTIONS.MARKETPLACE_AGENTS,
          payload: res?.data?.data,
        });
      }
    };
    getIntegrations();
  }, [dispatch]);

  const handleRoute = (label: string) => {
    dispatch({ type: ACTIONS.TOP_LABEL, payload: label });
    setActiveTopTab(label);
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Browse Colleagues"
        buttonIcon={
          <Search
            size={20}
            className="text-gray-600 cursor-pointer hover:text-gray-800"
          />
        }
      />

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

          <span
            onClick={() => handleRoute("Agent Marketplace")}
            className={`cursor-pointer flex items-center pb-4 ${
              activeTopTab === "Agent Marketplace"
                ? "text-black font-semibold border-b-2 border-blue-300"
                : "text-gray-500"
            }`}
          >
            Marketplace
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTopTab === "Agent Marketplace"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100"
              }`}
            >
              {state?.marketPlaceAgents?.length}
            </span>
          </span>
        </div>

        <div>
          {activeTopTab === "Active" && <ActiveAgents />}
          {activeTopTab === "Inactive" && <InActiveAgents />}
          {activeTopTab === "Agent Marketplace" && <AgentsMarketplace />}
        </div>
      </div>
    </div>
  );
};

export default BrowseAgents;
