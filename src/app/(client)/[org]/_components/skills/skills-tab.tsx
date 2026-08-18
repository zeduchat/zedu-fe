import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { SkillsDialog } from "./skills-dialog";
import { DataContext } from "~/store/GlobalState";
import SkillCard from "./skill-card";
import SkillConfigSidebar from "./skill-config";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddSkillsIcon } from "~/svgs";

const Skills = () => {
  const [openChange, setOpenChange] = useState(false);
  const { state } = useContext(DataContext);
  const { selectedSkills, skillSidebar } = state;

  useEffect(() => {
    if (skillSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [skillSidebar]);

  //

  return (
    <div className="my-5 relative">
      {selectedSkills?.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-sm">
            Added skills ({selectedSkills.length || 0})
          </h2>

          <Button
            onClick={() => setOpenChange(true)}
            className="flex items-center gap-1 bg-primary-500 text-white px-4 h-[33px] text-xs hover:bg-blue-100"
          >
            Add a skill
            <PlusIcon size={15} />
          </Button>
        </div>
      )}

      {selectedSkills && selectedSkills?.length === 0 && (
        <div className="flex flex-col items-center justify-center space-y-3 mt-15">
          <Image
            src="/image/empty-box.svg"
            alt="empty skills"
            width={100}
            height={100}
            unoptimized
            className="h-[200px] w-[200px]"
          />
          <p style={{ marginTop: "-25px" }}>
            {state.colleague?.name} doesn't have any skill yet
          </p>
          <Button
            onClick={() => setOpenChange(true)}
            className="flex items-center gap-2 bg-primary-500 text-white px-10 mt-2 hover:bg-blue-100"
          >
            Add a skill
            <AddSkillsIcon />
          </Button>
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
        {selectedSkills?.map((item: any) => (
          <SkillCard {...item} key={item.skill_id} />
        ))}
      </div>

      {state?.skillSidebar && (
        <div
          className={`fixed mt-[60px] right-0 top-0 w-full sm:w-[450px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_25px_0px_#DFDFDF] ${state?.skillSidebar ? "translate-x-0" : "translate-x-full"}`}
        >
          <SkillConfigSidebar />
        </div>
      )}

      {/* modal */}
      {openChange && (
        <SkillsDialog open={openChange} onOpenChange={setOpenChange} />
      )}
    </div>
  );
};

export default Skills;
