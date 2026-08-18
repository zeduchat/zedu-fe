"use client";

import { useContext, useEffect, useState } from "react";
import { Star, CheckCircle2, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { GetRequest, PatchRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import DetailsHeader from "../../../_components/colleagues/detail-header";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { Switch } from "~/components/ui/switch";
import FallbackImage from "~/components/layout/fallback-image";

export default function ColleageProfile() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const [star, setStar] = useState(false);

  // get single colleague
  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || "";

    if (id) {
      const getAgents = async () => {
        const res = await GetRequest(`/organisations/${orgId}/agents/${id}`);
        setAgent(res.data.data);
        dispatch({ type: ACTIONS.COLLEAGUE, payload: res.data.data });
        setLoading(false);
      };
      getAgents();
    }
  }, [id]);

  // get agent skills
  useEffect(() => {
    const getSkills = async () => {
      const res = await GetRequest(`/skills/agents/${id}`);
      if (res.status === 200 || res.status === 201) {
        dispatch({ type: ACTIONS.SELECTED_SKILLS, payload: res.data.data });
      }
      setLoading(false);
    };
    getSkills();
  }, [dispatch, state.skillsCallback]);

  const handleCopy = () => {
    navigator.clipboard.writeText(agent?.descriptions?.app_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSwitchChange = async (checked: boolean, id: string) => {
    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      integration_id: id,
      status: checked,
    };

    const res = await PatchRequest(
      `/organisations/${orgId}/agents/change_status`,
      payload
    );

    if (res?.status === 200 || res?.status === 201) {
      setAgent((prev: any) => ({
        ...prev,
        is_active: checked,
      }));
      dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback });
      dispatch({
        type: ACTIONS.AGENT_CALLBACK,
        payload: !state?.agentCallback,
      });
    }
  };

  //

  return (
    <>
      <DetailsHeader user={agent} />

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <Loading width="40" height="40" color="blue" />
        </div>
      ) : (
        <div className="bg-white p-4 md:p-6 mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="w-[100px] h-[100px] min-w-[100px] border rounded-xl shadow-sm overflow-hidden">
                <FallbackImage
                  src={agent?.avatar}
                  alt="colleague"
                  userType="bot"
                  className="w-[100px] h-[100px] object-cover"
                />
              </div>

              <div className="w-full">
                <h2 className="text-lg font-semibold flex items-center gap-2 flex-wrap">
                  {agent?.name || "Juno - Report Assistant"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {agent?.description || ""}
                </p>

                <div className="flex flex-wrap gap-3 items-center mt-3">
                  <Button
                    variant={"outline"}
                    className={`h-fit p-[7px] border-[#E6EAEF] hover:bg-gray-100 ${star ? "border-primary-500" : ""}`}
                    onClick={() => setStar(!star)}
                  >
                    <Star
                      size={20}
                      strokeWidth={1.5}
                      color={star ? "rgb(113, 65, 248)" : "#667085"}
                    />
                  </Button>

                  <div className="flex items-center gap-2 bg-indigo-50 px-2 py-2 rounded-md">
                    <a
                      href={`${process.env.NEXT_PUBLIC_CLIENT_URL}/ai-coworkers/${agent?.agent_slug}`}
                      className="text-sm text-indigo-600 font-medium break-all"
                    >
                      {`${process.env.NEXT_PUBLIC_CLIENT_URL}/ai-coworkers/${agent?.agent_slug}`}
                    </a>
                    <button onClick={handleCopy} className="text-indigo-500">
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 rounded-3xl border ${agent?.is_active ? "border-[#7141F8]" : ""} py-5 px-3 h-0`}
            >
              <span
                className={`text-sm ${agent?.is_active ? "text-[#7141F8]" : "text-[#667085]"}`}
              >
                {agent?.is_active ? "Enabled" : "Disabled"}
              </span>

              <Switch
                className="h-6 bg-green-500"
                checked={agent?.is_active}
                onCheckedChange={(checked) => {
                  handleSwitchChange(checked, id);
                }}
              />
            </div>
          </div>

          <hr className="my-5" />

          <div>
            <div className="mb-8">
              <div className="">
                {agent?.why_use && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#FA8F45] rounded-sm"></div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Why Use {agent?.name}?
                    </h2>
                  </div>
                )}
                <p className="text-gray-600 mb-6 w-3/5">{agent?.why_use}</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="p-0">
                {agent?.how_it_works && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#FA8F45] rounded-sm"></div>
                    <h2 className="text-base font-semibold text-gray-900 ">
                      How It Works
                    </h2>
                  </div>
                )}
                <p className="text-gray-600 mb-6 w-3/5">
                  {agent?.how_it_works}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="p-0">
                {agent?.benefits && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#FA8F45] rounded-sm"></div>
                    <h2 className="text-base font-semibold text-gray-900">
                      How Your Team Benefits
                    </h2>
                  </div>
                )}
                <p className="text-gray-600 mb-6 w-3/5">{agent?.benefits}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
