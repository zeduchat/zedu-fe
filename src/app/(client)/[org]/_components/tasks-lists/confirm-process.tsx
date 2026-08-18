"use client";

import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import { showError, showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";

interface ConfirmationModalProps {
  onCancel: () => void;
}

const ConfirmProcessModal: React.FC<ConfirmationModalProps> = ({
  onCancel,
}) => {
  const params = useParams();
  const id = params.id as string;
  const [processLoading, setProcessLoading] = useState(false);
  const { state, dispatch } = useContext(DataContext);

  const handleProcess = async () => {
    setProcessLoading(true);
    const res = await GetRequest(`/tasks/${id}/process`);
    if (res.status === 200 || res.status === 201) {
      showSuccess(res.data.message);
      dispatch({
        type: ACTIONS.TASKS_CALLBACK,
        payload: !state?.tasksCallback,
      });

      onCancel();
      setProcessLoading(false);
    } else {
      showError(res.response.data.message);
      setProcessLoading(false);
    }
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
          <h2 className="text-xl font-semibold">Process Tasks?</h2>
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
          Are you sure you want to process this task?, Note that this will
          override your existing workflow configuration.
        </p>

        <p className="mt-2 text-sm px-6">
          If Yes, click on the Proceed button below.
        </p>

        <div className="mt-6 flex justify-end gap-3 px-4 py-6 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No, Cancel
          </button>

          <button
            onClick={handleProcess}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {processLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Processing</span>
                <Loading width="20" height="20" />
              </span>
            ) : (
              "Yes, Proceed"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmProcessModal;
