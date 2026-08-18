import Image from "next/image";
import { useContext, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import PromptCard from "./prompt-card";
import CreatePromptsModal from "./create-prompt";

const PromptTab = () => {
  const { state } = useContext(DataContext);
  const { prompts } = state;
  const [createPrompt, setCreatePrompt] = useState(false);

  return (
    <div className="my-5 relative">
      {prompts?.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-sm">Created Prompts ({prompts.length || 0})</h2>

          <Button
            onClick={() => setCreatePrompt(true)}
            className="flex items-center gap-1 bg-primary-500 text-white px-4 h-[33px] text-xs hover:bg-blue-100"
          >
            Add a prompt
            <PlusIcon size={15} />
          </Button>
        </div>
      )}

      {prompts?.length === 0 && !createPrompt && (
        <div className="flex flex-col items-center justify-center space-y-3 mt-15">
          <Image
            src="/image/empty-box.svg"
            alt="empty skills"
            width={100}
            height={100}
            unoptimized
            className="h-[200px] w-[200px]"
          />
          <p style={{ marginTop: "-25px" }}>Create new prompt</p>
          <Button
            onClick={() => setCreatePrompt(true)}
            className="flex items-center gap-2 bg-primary-500 text-white px-8 mt-2 hover:bg-blue-100"
          >
            Add a prompt
            <PlusIcon />
          </Button>
        </div>
      )}

      <div>
        {prompts?.map((item: any, index: number) => (
          <PromptCard {...item} key={index} />
        ))}
      </div>

      {createPrompt && (
        <CreatePromptsModal open={createPrompt} setOpen={setCreatePrompt} />
      )}
    </div>
  );
};

export default PromptTab;
