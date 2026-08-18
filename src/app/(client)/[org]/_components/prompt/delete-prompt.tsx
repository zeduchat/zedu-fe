"use client";

import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import { showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { DeleteRequest } from "~/utils/new-request";

interface ConfirmationModalProps {
  onCancel: () => void;
  promptId: string;
}

const DeletePromptModal: React.FC<ConfirmationModalProps> = ({
  onCancel,
  promptId,
}) => {
  const params = useParams();
  const id = params.id as string;
  const [deleteloading, setDeleteloading] = useState(false);
  const { state, dispatch } = useContext(DataContext);

  const deletePrompt = async () => {
    setDeleteloading(true);

    const res = await DeleteRequest(`/agents/${id}/prompts/${promptId}`);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.PROMPT_CALLBACK,
        payload: !state.promptCallback,
      });
      showSuccess(res?.data?.message);
      onCancel();
    }
    setDeleteloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="z-10 max-w-xl bg-white rounded-xl shadow-xl ">
        {/* Title */}
        <div className="flex items-start justify-between px-6 py-4">
          <h2 className="text-xl font-semibold">Delete Prompt</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition border py-1 px-2 rounded"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <hr />

        <p className="my-4 px-6">
          Are you sure you want to delete this prompt? This action cannot be
          undone.
        </p>

        <p className="mt-4 text-sm pt-4 px-6">
          <strong>Note:</strong> Note: You could always add this prompt later
        </p>

        <div className="mt-6 flex justify-end gap-3 px-4 py-6 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No, Cancel
          </button>

          <button
            onClick={deletePrompt}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            {deleteloading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Deleting</span>
                <Loading width="20" height="20" />
              </span>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePromptModal;
