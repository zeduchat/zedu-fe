"use client";

import React, { useState } from "react";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import DeletePromptModal from "./delete-prompt";
import EditPromptsModal from "./edit-prompt";

interface TaskProps {
  id: string;
  name: string;
  content: string;
  type: string;
}

const PromptCard = ({ name, content, type, id }: TaskProps) => {
  const [deletePrompt, setDeletePrompt] = useState(false);
  const [editPrompt, setEditPrompt] = useState(false);

  return (
    <div className="w-full py-4">
      <div className="relative border-b-2 border-dashed border-gray-200 pb-4 flex items-center gap-2 px-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-normal text-gray-700">{name}</h3>
            <Badge
              variant="outline"
              className="bg-[#F1F1FE] text-primary-500 rounded-md font-normal text-xs px-2 py-[6px]"
            >
              {type}
            </Badge>
          </div>

          <p className="text-xs font-normal text-gray-700">{content}</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 border">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setEditPrompt(true)}
                className=" hover:bg-primary-50 flex items-center space-x-2 cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Prompt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletePrompt(true)}
                className=" hover:bg-primary-50 flex items-center space-x-2 text-red-600 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete Prompt</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* edit modal */}
      {editPrompt && (
        <EditPromptsModal
          open={editPrompt}
          setOpen={setEditPrompt}
          prompt={{ name, content, type, id }}
        />
      )}

      {/* delete modal */}
      {deletePrompt && (
        <DeletePromptModal
          onCancel={() => setDeletePrompt(false)}
          promptId={id}
        />
      )}
    </div>
  );
};

export default PromptCard;
