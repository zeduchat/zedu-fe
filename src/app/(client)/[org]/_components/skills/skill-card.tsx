import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SmallSwitch } from "~/components/ui/small-switch";
import DeleteSkillsModal from "./delete-skills";
import { useContext, useState, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest, PutRequest } from "~/utils/new-request";
import images from "~/assets/images";
import { useParams } from "next/navigation";

interface Skills {
  name: string;
  icon: string;
  skill_id: string;
  short_description: string;
  is_active: boolean;
  id: string;
}

const SkillCard = (props: Skills) => {
  const [deleteSkill, setDeleteSkill] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const [isActive, setIsActive] = useState(props.is_active);
  const [isToggling, setIsToggling] = useState(false);
  const { id: agentId } = useParams();

  // Keep local state in sync with parent prop changes
  useEffect(() => {
    setIsActive(props.is_active);
  }, [props.is_active]);

  const handleSwitchChange = async (checked: boolean) => {
    setIsToggling(true);

    const payload = {
      is_active: isActive ? false : true,
    };

    try {
      const res = await PutRequest(
        `/skills/${props.skill_id}/agents/${agentId}`,
        payload
      );

      if (res?.status === 200 || res?.status === 201) {
        // Update local state on success
        setIsActive(checked);
        // Dispatch to trigger re-fetch in the parent component
        dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback });
      } else {
        // Log error and revert state if API call fails
        console.error("Failed to update skill status:", res);
      }
    } catch (error) {
      console.error("An error occurred during toggle:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleOpen = async () => {
    dispatch({ type: ACTIONS.SKILL_LOADING, payload: true });
    dispatch({ type: ACTIONS.SKILL_SIDEBAR, payload: true });

    const res = await GetRequest(
      `/skills/${props?.skill_id}/agents/${agentId}`
    );
    if (res.status === 200 || res.status === 201) {
      dispatch({ type: ACTIONS.SKILL, payload: res.data.data });
    }

    dispatch({ type: ACTIONS.SKILL_LOADING, payload: false });
  };

  return (
    <div
      className={`w-full border rounded-lg transition-all border-2 border-gray-200 hover:border-primary-300`}
    >
      <div className="flex items-start justify-between flex-wrap gap-3 pt-4 pb-2 px-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`min-w-8 min-h-8 rounded-md flex items-center justify-center text-white text-sm bg-[#F1F1FE] border`}
          >
            <Image
              src={props?.icon || images.bot}
              alt="skill"
              width={20}
              height={20}
              unoptimized
            />
          </div>
          <h4 className="font-medium text-sm text-gray-900">{props?.name}</h4>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <div
            className={`flex items-center gap-1 rounded-3xl border ${isActive ? "border-[#7141F8]" : ""} py-4 px-3 h-0`}
          >
            <span
              className={`text-[10px] ${isActive ? "text-[#7141F8]" : "text-[#667085]"}`}
            >
              {isToggling ? "Updating..." : isActive ? "Active" : "Disabled"}
            </span>

            <SmallSwitch
              className="bg-green-500"
              checked={isActive}
              onCheckedChange={handleSwitchChange}
              disabled={isToggling}
              size="sm"
            />
          </div>
          |
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-gray-100 border">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100"
                onClick={handleOpen}
              >
                Edit Configuration
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500 hover:bg-gray-100"
                onClick={() => setDeleteSkill(true)}
              >
                Remove Skill
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <hr />

      <div className="flex-1 min-w-0 p-4">
        <p className="text-xs text-[#667085] leading-relaxed">
          {props?.short_description}
        </p>
      </div>

      {deleteSkill && (
        <DeleteSkillsModal
          onCancel={() => setDeleteSkill(false)}
          skill={props}
        />
      )}
    </div>
  );
};

export default SkillCard;
