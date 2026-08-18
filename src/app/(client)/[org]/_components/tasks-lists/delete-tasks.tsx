"use client";

import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { DeleteRequest } from "~/utils/new-request";

interface ConfirmationModalProps {
  onCancel: () => void;
  task: {
    id: string;
    text: string;
  };
}

const DeleteTasksModal: React.FC<ConfirmationModalProps> = ({
  onCancel,
  task,
}) => {
  const params = useParams();
  const id = params.id as string;
  const [deleteloading, setDeleteloading] = useState(false);
  const { state, dispatch } = useContext(DataContext);

  const deleteSkill = async () => {
    setDeleteloading(true);

    const res = await DeleteRequest(`/tasks/${task.id}/agents/${id}`);
    if (res.status === 200 || res.status === 201) {
      dispatch({
        type: ACTIONS.TASKS_CALLBACK,
        payload: !state?.tasksCallback,
      });
    }
    onCancel();
    setDeleteloading(false);
  };

  //

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
        <div className="flex items-start justify-between p-4">
          <h2 className="text-xl font-semibold">Delete Task</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition border py-1 px-2 rounded"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <hr className="mb-4" />

        <p className="mb-4 px-6">
          Are you sure you want to delete this task? {state.colleague?.name}{" "}
          would no longer be able to perform task.
        </p>

        <p className="mt-2 text-sm px-6">
          <strong>Note:</strong> You could always add this task later
        </p>

        <div className="mt-6 flex justify-end gap-3 px-4 py-6 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No, Cancel
          </button>

          <button
            onClick={deleteSkill}
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

export default DeleteTasksModal;
