import Image from "next/image";
import { useContext, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import TaskCard from "./task-card";
import { Button } from "~/components/ui/button";
import { Plus, PlusIcon } from "lucide-react";
import CreateTask from "./create-task";
import ConfirmProcessModal from "./confirm-process";

const TasksTabs = () => {
  const { state } = useContext(DataContext);
  const { tasks, colleague } = state;
  const [showInput, setShowInput] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // handle submit

  return (
    <div className="my-5 relative">
      {tasks?.length === 0 && !showInput && (
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
            What would you like {colleague?.name} to be able to do
          </p>
          <Button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 bg-primary-500 text-white px-8 mt-2 hover:bg-blue-100"
          >
            Add a task
            <PlusIcon />
          </Button>
        </div>
      )}

      <div>
        {tasks?.map((item: any, index: number) => (
          <TaskCard {...item} key={index} />
        ))}
      </div>

      {showInput && <CreateTask onCancel={() => setShowInput(false)} />}

      {tasks?.length > 0 && !showInput && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowInput(true)}
          >
            <Plus size={18} />
            Add new Task
          </Button>

          <Button
            onClick={() => setConfirm(true)}
            className="flex itms-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Process tasks
          </Button>
        </div>
      )}

      {confirm && <ConfirmProcessModal onCancel={() => setConfirm(false)} />}
    </div>
  );
};

export default TasksTabs;
