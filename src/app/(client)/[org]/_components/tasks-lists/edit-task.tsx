import { GripVertical, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PutRequest } from "~/utils/new-request";

interface PromptProps {
  open: boolean;
  setOpen: any;
  task: { id: string; text: string; position: number };
}

export default function EditTaskModal({ open, setOpen, task }: PromptProps) {
  const { state, dispatch } = useContext(DataContext);
  const isEditing = !!task;
  const [content, setContent] = useState(task?.text || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { id } = useParams();
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleSave = async () => {
    setEditLoading(true);

    const payload = {
      position: task.position,
      text: content,
    };

    const res = await PutRequest(`/tasks/${task.id}/agents/${id}`, payload);
    if (res.status === 200 || res.status === 201) {
      dispatch({
        type: ACTIONS.TASKS_CALLBACK,
        payload: !state?.tasksCallback,
      });
    }
    setOpen(false);
    setContent("");
    setEditLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] rounded-xl px-0 py-4">
        <DialogHeader className="flex flex-row items-center justify-between px-6">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Task" : "Add Task"}
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[480px] px-6 pt-4 border-t">
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-sm text-gray-400 font-medium">
                {isEditing ? "Edit your task" : "Add Task"}
              </p>
              <div className="w-full border border-gray-300 p-2 rounded-md overflow-hidden bg-white shadow-sm hover:border-[#A5B4FC] focus-within:border-[#A5B4FC] transition-colors duration-150">
                <textarea
                  ref={textareaRef}
                  className="w-full text-sm outline-none border-none focus:ring-0 resize-none"
                  placeholder="Enter task..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 flex justify-end gap-3 px-6 border-t">
          <Button
            className="bg-white border text-gray-800 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Update {editLoading && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
