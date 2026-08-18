"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";

import { Button } from "~/components/ui/button";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import Loading from "~/components/ui/loading";

interface SubtaskComponentProps {
  onCancel: () => void;
}

const CreateTask = ({ onCancel }: SubtaskComponentProps) => {
  const [content, setContent] = useState("");
  const { state, dispatch } = useContext(DataContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleSave = async () => {
    setSaveLoading(true);
    const nextPosition = state?.tasks?.length ? state?.tasks.length + 1 : 1;
    const payload = {
      id: crypto.randomUUID(),
      text: content.trim(),
      position: nextPosition,
    };

    const res = await PostRequest(`/tasks/${id}`, payload);
    if (res.status === 200 || res.status === 201) {
      dispatch({
        type: ACTIONS.TASKS_CALLBACK,
        payload: !state?.tasksCallback,
      });
    }
    onCancel();
    setSaveLoading(false);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-2">
        {/* Grip Icon for drag and drop */}
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
          <GripVertical className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col gap-2">
          {/* Subtask Header */}
          <p className="text-sm text-gray-400 font-medium">Add Task</p>

          {/* Task Content Textarea */}
          <div
            className="w-full border border-gray-300 p-4 rounded-md overflow-hidden bg-white shadow-sm
                            hover:border-[#A5B4FC] focus-within:border-[#A5B4FC]
                            transition-colors duration-150"
          >
            <textarea
              ref={textareaRef}
              className="w-full text-sm outline-none border-none focus:ring-0 resize-none"
              placeholder="Read gmail and store the results in $all_emails."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-1">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
              >
                Save {saveLoading && <Loading />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
