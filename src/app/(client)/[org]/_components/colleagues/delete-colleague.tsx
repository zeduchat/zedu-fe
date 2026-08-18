"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { DeleteRequest } from "~/utils/new-request";

interface ConfirmationModalProps {
  onCancel: () => void;
  agent: any;
}

const DeleteColleagueModal: React.FC<ConfirmationModalProps> = ({
  onCancel,
  agent,
}) => {
  const params = useParams();
  const id = params.id as string;
  const [deleteloading, setDeleteloading] = useState(false);
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug } = state;

  const deleteAgent = async () => {
    const orgId = localStorage.getItem("orgId") || "";

    setDeleteloading(true);

    const res = await DeleteRequest(`/organisations/${orgId}/agents/${id}`);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.AGENT_CALLBACK,
        payload: !state?.agentCallback,
      });
      showSuccess(res?.data?.message);
      router.push(`/${orgSlug}/colleagues`);
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
      <div className="z-10 w-[90%] max-w-md bg-white rounded-xl shadow-xl p-6">
        {/* Title */}
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Delete ({agent?.name})
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <hr className="my-4" />

        {/* Content */}
        <div className="mt-4 text-sm text-gray-800">
          <p className="mb-4">
            Are you sure you want to delete{" "}
            <span className="text-blue-600 font-medium">{agent?.name}</span>?
            This will be recorded for accountability purposes. Here is what
            happens when you delete a colleague:
          </p>

          <ul className="space-y-2 text-sm text-gray-800 list-none">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-[2px]">✔</span>
              <span>
                Your entire organisation loses access to this colleague.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-[2px]">✔</span>
              <span>You retain all previous messages with this colleague.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-[2px]">✔</span>
              <span>The colleague becomes inactive and unresponsive.</span>
            </li>
          </ul>
        </div>

        <hr className="my-6" />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={deleteAgent}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            {deleteloading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Deleting...</span>
                <Loading width="20" height="20" />
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteColleagueModal;
