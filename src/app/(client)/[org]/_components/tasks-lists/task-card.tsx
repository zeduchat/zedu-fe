"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  GripVertical,
  Edit,
  Plus,
  MessageSquare,
  Trash,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import DeleteTasksModal from "./delete-tasks";
import EditTaskModal from "./edit-task";

interface TaskProps {
  id: string;
  text: string;
  position: number;
}

const TaskCard = ({ id, text, position }: TaskProps) => {
  const [deleteTask, setDeleteTask] = useState(false);
  const [editTask, setEditTask] = useState(false);

  const renderNameWithVariables = (text: string) => {
    const parts = text?.split(/(\$\S+)/);
    return parts?.map((part, index) =>
      part.startsWith("$") ? (
        <span key={index} className="text-blue-600 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-full py-4">
      <div className="relative border-b-2 border-dashed border-gray-200 pb-4 flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-sm font-normal text-gray-700">
            {renderNameWithVariables(text)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold text-xs px-2 py-1"
          >
            Skill not found
          </Badge> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 border">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setEditTask(true)}
                className=" hover:bg-primary-50 flex items-center space-x-2 cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem className=" hover:bg-primary-50 flex items-center space-x-2 cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Subtask</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className=" hover:bg-primary-50 flex items-center space-x-2 cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>View Comments</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTask(true)}
                className=" hover:bg-primary-50 flex items-center space-x-2 text-red-600 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {deleteTask && (
        <DeleteTasksModal
          onCancel={() => setDeleteTask(false)}
          task={{ id, text }}
        />
      )}
      {editTask && (
        <EditTaskModal
          open={editTask}
          setOpen={setEditTask}
          task={{ id, text, position }}
        />
      )}
    </div>
  );
};

export default TaskCard;
