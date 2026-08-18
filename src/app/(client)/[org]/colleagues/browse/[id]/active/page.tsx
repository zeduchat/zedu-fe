"use client";

import { useContext, useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  Copy,
  ListFilter,
  SquareGanttChart,
  Code,
  GitFork,
} from "lucide-react";
import { useParams } from "next/navigation";
import { GetRequest, PatchRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { Switch } from "~/components/ui/switch";
import DetailsHeader from "~/app/(client)/[org]/_components/colleagues/detail-header";
import TasksTabs from "~/app/(client)/[org]/_components/tasks-lists/task-tab";
import Skills from "~/app/(client)/[org]/_components/skills/skills-tab";
import PromptTab from "~/app/(client)/[org]/_components/prompt";
import NodesEditor from "~/app/(client)/[org]/_components/tasks-lists/nodes-editor";
import FallbackImage from "~/components/layout/fallback-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import JSONEditor from "~/app/(client)/[org]/_components/tasks-lists/json-viewer";
import PublishForm from "~/app/(client)/[org]/_components/publish-agent/publish";

export default function ColleageProfile() {
  const [activeTab, setActiveTab] = useState("Task List");
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const [view, setView] = useState("Visual Builder");
  const [star, setStar] = useState(false);

  // get single colleague
  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || "";

    if (id) {
      const getAgents = async () => {
        const res = await GetRequest(`/organisations/${orgId}/agents/${id}`);
        if (res.status === 200 || res.status === 201) {
          setAgent(res.data.data);
          dispatch({ type: ACTIONS.COLLEAGUE, payload: res.data.data });
        }
        setLoading(false);
      };
      getAgents();
    }
  }, [id]);

  // get tasks
  useEffect(() => {
    const getTasks = async () => {
      const res = await GetRequest(`/tasks/${id}`);
      if (res.status === 200 || res.status === 201) {
        dispatch({ type: ACTIONS.TASKS, payload: res.data.data });
      }
    };
    getTasks();
  }, [state?.tasksCallback]);

  // fetch workflow json
  useEffect(() => {
    const getTasks = async () => {
      const res = await GetRequest(`/agents/${id}/workflows`);
      if (res.status === 200 || res.status === 201) {
        dispatch({ type: ACTIONS.WORKFLOW, payload: res.data.data[0] });
      }
    };
    getTasks();
  }, [state?.tasksCallback]);

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

  // get general skills
  useEffect(() => {
    const getSkills = async () => {
      try {
        setLoading(true);
        const res = await GetRequest("/skills");
        if (res.status === 200 || res.status === 201) {
          dispatch({ type: ACTIONS.AGENT_SKILLS, payload: res.data.data });
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setLoading(false);
      }
    };

    getSkills();
  }, [dispatch]);

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
    }
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  const TABS = ["Task List", "Skills", "Prompt", "Publish"];

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
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

          {/* <MessageInput /> */}

          {/* Tabs */}
          <div className="flex items-center justify-between mt-8 border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Task List" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
                  >
                    <ListFilter size={16} />
                    View: {view}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleViewChange("Visual Builder")}
                  >
                    <SquareGanttChart className="mr-2 h-4 w-4" />
                    <span>Visual Builder</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleViewChange("JSON")}
                  >
                    <Code className="mr-2 h-4 w-4" />
                    <span>JSON</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleViewChange("List of Nodes")}
                  >
                    <GitFork className="mr-2 h-4 w-4" />
                    <span>List of Nodes</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "Task List" && (
            <>
              {view === "Visual Builder" && <TasksTabs />}
              {view === "JSON" && <JSONEditor />}
              {view === "List of Nodes" && <NodesEditor />}
            </>
          )}

          {activeTab === "Skills" && <Skills />}

          {activeTab === "Prompt" && <PromptTab />}

          {activeTab === "Publish" && <PublishForm />}
        </div>
      )}
    </>
  );
}
